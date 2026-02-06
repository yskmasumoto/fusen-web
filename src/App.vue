<script setup lang="ts">
import FusenManage from './components/FusenManage.vue';
</script>

<template>
	<div class="app-shell">
		<header class="app-header">
			<p class="eyebrow">Fusen Board</p>
			<h1>付箋ボード</h1>
			<p class="subtitle">Markdownで書いて、ドラッグで整える。</p>
		</header>
		<main class="app-main">
			<FusenManage />
		</main>
	</div>
</template>
