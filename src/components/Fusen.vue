<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import DOMPurify from 'dompurify';

interface Position {
  x: number;
  y: number;
}

interface Note {
  id: number;
  x: number;
  y: number;
  markdown: string;
  isEditing: boolean;
}

const props = defineProps<{ note: Note }>();
const emit = defineEmits<{
  (e: 'update', id: number, patch: Partial<Note>): void;
  (e: 'delete', id: number): void;
}>();

const noteRef = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);
const trail = ref<Position[]>([]);
const isTrailVisible = ref(false);
const dragOffset = ref<Position>({ x: 0, y: 0 });

const getMarkdownHtml = (source: string): string => {
  const bunMarkdown = (globalThis as { Bun?: { markdown?: { html?: (input: string) => string } } })
    .Bun?.markdown?.html;

  if (bunMarkdown) {
    return bunMarkdown(source);
  }

	return '<p>Markdown parser is unavailable in this runtime.</p>';
};

const renderedHtml = computed(() => {
  const raw = getMarkdownHtml(props.note.markdown);
  return DOMPurify.sanitize(raw);
});

const getContainerRect = (): DOMRect => {
	const container = noteRef.value?.offsetParent as HTMLElement | null;
	return container?.getBoundingClientRect() ?? new DOMRect(0, 0, 0, 0);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !noteRef.value) return;
	const containerRect = getContainerRect();
	const newX = event.clientX - containerRect.left - dragOffset.value.x;
	const newY = event.clientY - containerRect.top - dragOffset.value.y;

  emit('update', props.note.id, { x: newX, y: newY });
  trail.value = [...trail.value, { x: newX, y: newY }].slice(-10);
};

const handleMouseUp = () => {
  isDragging.value = false;
  isTrailVisible.value = false;
  window.setTimeout(() => {
    trail.value = [];
  }, 260);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const startDrag = (event: MouseEvent) => {
	if (!noteRef.value) return;
	const containerRect = getContainerRect();
	dragOffset.value = {
		x: event.clientX - containerRect.left - props.note.x,
		y: event.clientY - containerRect.top - props.note.y,
	};
  isDragging.value = true;
  isTrailVisible.value = true;
  trail.value = [];
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const toggleEdit = () => {
  emit('update', props.note.id, { isEditing: !props.note.isEditing });
};

const updateMarkdown = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update', props.note.id, { markdown: target.value });
};

const deleteNote = () => {
  emit('delete', props.note.id);
};

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<template>
	<template v-if="isTrailVisible">
		<div
			v-for="(pos, index) in trail"
			:key="index"
			class="note-trail"
			:style="{
				left: `${pos.x}px`,
				top: `${pos.y}px`,
				opacity: (index + 1) / trail.length
			}"
		/>
	</template>
	<div
		ref="noteRef"
		class="note"
		:class="{ 'note--dragging': isDragging }"
		:style="{
			left: `${note.x}px`,
			top: `${note.y}px`
		}"
	>
		<div class="note-header" @mousedown.prevent="startDrag">
			<button class="icon-button" type="button" @mousedown.stop @click="toggleEdit">
				{{ note.isEditing ? "プレビュー" : "編集" }}
			</button>
			<button
				class="icon-button danger"
				type="button"
				@mousedown.stop
				@click="deleteNote"
			>
				✕
			</button>
		</div>
		<div class="note-body">
			<textarea
				v-if="note.isEditing"
				class="note-input"
				:value="note.markdown"
				@input="updateMarkdown"
			></textarea>
			<div v-else class="note-preview" v-html="renderedHtml"></div>
		</div>
	</div>
</template>
