<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import Fusen from './Fusen.vue';

interface Note {
  id: number;
  x: number;
  y: number;
  markdown: string;
  isEditing: boolean;
}

const storageKey = 'fusen-web.notes.v1';
const notes = ref<Note[]>([]);
const defaultMarkdown = '# 新しい付箋\n\n- Markdownでメモ\n- ドラッグで移動\n\n`/`で囲むとコード';
const boardRef = ref<HTMLDivElement | null>(null);
const folderHandle = ref<FileSystemDirectoryHandle | null>(null);
const saveStatus = ref('');
const supportsFileSystemAccess = 'showDirectoryPicker' in window;
let saveTimer: number | undefined;

type FileSystemHandlePermissionDescriptor = {
  mode?: 'read' | 'readwrite';
};

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
  }
}

const folderLabel = computed(() => folderHandle.value?.name ?? '未選択');

const addNote = () => {
  const index = notes.value.length;
  const offset = 24 + (index % 6) * 18;
  const newNote: Note = {
    id: Date.now(),
    x: 32 + offset,
    y: 32 + offset,
    markdown: defaultMarkdown,
    isEditing: true,
  };

  notes.value = [...notes.value, newNote];
};

const removeNote = (id: number) => {
  notes.value = notes.value.filter((note) => note.id !== id);
};

const updateNote = (id: number, patch: Partial<Note>) => {
  notes.value = notes.value.map((note) => (note.id === id ? { ...note, ...patch } : note));
};

const gatherNotes = () => {
  const board = boardRef.value;
  if (!board) return;

  const boardWidth = board.clientWidth || 1200;
  const padding = 16;
  const gap = 16;
  const noteWidth = boardWidth < 720 ? 200 : 240;
  const noteHeight = boardWidth < 720 ? 160 : 180;
  const columns = Math.max(1, Math.floor((boardWidth - padding * 2 + gap) / (noteWidth + gap)));

  notes.value = notes.value.map((note, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = padding + col * (noteWidth + gap);
    const y = padding + row * (noteHeight + gap);

    return {
      ...note,
      x,
      y,
    };
  });
};

const ensureFolderPermission = async () => {
  if (!folderHandle.value) return false;

  const permissionHandle = folderHandle.value as FileSystemDirectoryHandle & {
    queryPermission?: (descriptor: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>;
    requestPermission?: (descriptor: FileSystemHandlePermissionDescriptor) => Promise<PermissionState>;
  };
  const options: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' };

  if (permissionHandle.queryPermission && (await permissionHandle.queryPermission(options)) === 'granted') {
    return true;
  }

  if (!permissionHandle.requestPermission) {
    return false;
  }

  return (await permissionHandle.requestPermission(options)) === 'granted';
};

const writeNoteToFolder = async (note: Note) => {
  if (!folderHandle.value) return;

  const filename = `note-${note.id}.md`;
  const fileHandle = await folderHandle.value.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(note.markdown);
  await writable.close();
};

const saveAllNotes = async () => {
  if (!folderHandle.value) {
    saveStatus.value = '保存先フォルダが選択されていません。';
    return;
  }

  if (!(await ensureFolderPermission())) {
    saveStatus.value = 'フォルダへの書き込みが許可されていません。';
    return;
  }

  await Promise.all(notes.value.map((note) => writeNoteToFolder(note)));
  saveStatus.value = `保存しました: ${new Date().toLocaleTimeString()}`;
};

const pickFolder = async () => {
  saveStatus.value = '';
  if (!supportsFileSystemAccess) {
    saveStatus.value = 'このブラウザはフォルダ選択に対応していません。';
    return;
  }

  try {
    const picker = window.showDirectoryPicker;
    if (!picker) {
      saveStatus.value = 'このブラウザはフォルダ選択に対応していません。';
      return;
    }

    const handle = await picker();
    folderHandle.value = handle;
    await ensureFolderPermission();
    saveStatus.value = `保存先: ${handle.name}`;
  } catch (error) {
    if ((error as { name?: string }).name !== 'AbortError') {
      saveStatus.value = 'フォルダ選択に失敗しました。';
    }
  }
};

const normalizeNotes = (raw: unknown): Note[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item, index) => {
    const candidate = typeof item === 'object' && item ? (item as Record<string, unknown>) : {};
    const id = typeof candidate.id === 'number' ? candidate.id : Date.now() + index;
    const x = typeof candidate.x === 'number' ? candidate.x : 32 + index * 12;
    const y = typeof candidate.y === 'number' ? candidate.y : 32 + index * 12;
    const markdown = typeof candidate.markdown === 'string' ? candidate.markdown : defaultMarkdown;

    return {
      id,
      x,
      y,
      markdown,
      isEditing: false,
    };
  });
};

const loadNotes = () => {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    notes.value = normalizeNotes(parsed);
  } catch {
    notes.value = [];
  }
};

watch(
  notes,
  (current) => {
    const snapshot = current.map(({ id, x, y, markdown }) => ({
      id,
      x,
      y,
      markdown,
    }));
    localStorage.setItem(storageKey, JSON.stringify(snapshot));

    if (!folderHandle.value) {
      return;
    }

    if (saveTimer) {
      window.clearTimeout(saveTimer);
    }

    saveTimer = window.setTimeout(() => {
      void saveAllNotes();
    }, 700);
  },
  { deep: true },
);

onMounted(() => {
  loadNotes();
  if (notes.value.length === 0) {
    addNote();
  }
});
</script>

<template>
	<section class="board">
    <div class="board-meta">
      <div class="board-meta__path">
        <span class="label">保存先</span>
        <span class="value">{{ folderLabel }}</span>
      </div>
      <div class="board-meta__actions">
        <button class="ghost" type="button" @click="pickFolder">フォルダを選択</button>
        <button class="ghost" type="button" @click="saveAllNotes">今すぐ保存</button>
        <button class="ghost" type="button" @click="gatherNotes">付箋を集約</button>
      </div>
      <p v-if="saveStatus" class="board-meta__status">{{ saveStatus }}</p>
    </div>
		<div class="toolbar">
			<button class="primary" type="button" @click="addNote">付箋を追加</button>
			<div class="stats">付箋数: {{ notes.length }}</div>
		</div>
    <div ref="boardRef" class="note-layer">
			<Fusen
				v-for="note in notes"
				:key="note.id"
				:note="note"
				@update="updateNote"
				@delete="removeNote"
			/>
		</div>
	</section>
</template>
