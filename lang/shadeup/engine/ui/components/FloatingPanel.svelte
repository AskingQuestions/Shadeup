<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { UIChild } from '../puck';
	import { measureElement } from '$lib/measure';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	export let children: UIChild[] = [];
	let panelHeight = writable(0);
	let open = true;

	let isFullscreen = false;

	$: shouldPush = open && children && children.length > 0;

	$: styleStr = `<style> .stater {
		transition: 0.2s all;
		
		margin-right: ${shouldPush ? '186px;' : '0px'}
		margin-top: ${shouldPush ? '4px;' : '0px'}
	}</style>`;

	onMount(() => {
		isFullscreen = window.innerHeight >= screen.height;
	});
</script>

<svelte:window
	on:resize={() => {
		isFullscreen = window.innerHeight >= screen.height;
	}}
/>

{@html styleStr}
{#if children.length > 0}
	<div
		class="z-40 absolute  flex flex-col items-end justify-start"
		class:right-2={!isFullscreen || (isFullscreen && !open)}
		class:top-10={!isFullscreen}
		class:right-8={isFullscreen && open}
		class:top-8={isFullscreen}
	>
		<div
			class="floating-panel scrollbar bg-gray-800 over border border-gray-800 rounded-lg shadow-lg flex flex-col overflow-x-hidden backdrop-blur-sm bg-opacity-20 transition-all duration-300"
			class:w-0={!open}
			class:w-[200px]={open}
			class:mr-4={!open}
			style="max-height: calc(100vh - 64px - 16px); overflow-y: overlay;"
			use:measureElement={{ height: panelHeight }}
		>
			{#each children as child}
				<div class="min-w-[200px] control-{child.name}">
					<svelte:component
						this={child.type}
						value={child.value}
						setValue={child.setValue}
						children={child.children}
						{...child.options}
					/>
				</div>
			{/each}
		</div>

		{#if isFullscreen}
			<button
				transition:slide
				class="bg-gray-700 rounded-md shadow-lg backdrop-blur-sm bg-opacity-30 w-4 h-4 flex items-center justify-center transition-all duration-300"
				style="margin-top: {open ? 2 : -($panelHeight + 8)}px;"
				class:mr-4={!open}
				on:click={() => {
					open = !open;
				}}
			>
				<svg
					class="transition-all duration-300 transform max-w-[16px]"
					class:rotate-180={!open}
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 0 24 24"
					width="24px"
					fill="#fff"
					><path d="M0 0h24v24H0V0z" fill="none" /><path
						d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"
					/></svg
				>
			</button>
		{:else}
			<button
				transition:slide
				class="bg-gray-700 rounded-r-md shadow-lg backdrop-blur-sm bg-opacity-30 w-4 h-4 flex items-center justify-center transition-all duration-300"
				style="margin-top: {open ? 2 : -($panelHeight / 2 + 8)}px;"
				on:click={() => {
					open = !open;
				}}
			>
				<svg
					class="transition-all duration-300 transform max-w-[16px]"
					class:rotate-180={!open}
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 0 24 24"
					width="24px"
					fill="#fff"
					><path d="M0 0h24v24H0V0z" fill="none" /><path
						d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"
					/></svg
				>
			</button>
		{/if}
	</div>
{/if}

<style lang="scss">
	/* ===== Scrollbar CSS ===== */
	/* Firefox */
	.scrollbar {
		scrollbar-width: auto;
		scrollbar-color: rgb(63, 63, 63) #161616;
	}

	/* Chrome, Edge, and Safari */
	.scrollbar::-webkit-scrollbar {
		width: 0px;
	}

	.scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.scrollbar::-webkit-scrollbar-thumb {
		background-color: rgb(63, 63, 63);
		border-radius: 10px;
		border: 1px solid #161616;
	}
</style>
