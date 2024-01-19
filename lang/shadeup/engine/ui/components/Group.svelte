<script lang="ts">
	import { measureElement } from '$lib/measure';
	import { writable } from 'svelte/store';
	import type { UIChild } from '../puck';

	export let value: string;
	export let children: UIChild[];
	let open = true;
	let height = writable(0);
</script>

<div class="flex flex-col">
	<button
		class="flex flex-row items-center mx-1  bg-gray-500 bg-opacity-5"
		class:rounded-md={!open}
		class:rounded-t-md={open}
		on:click={() => {
			open = !open;
		}}
	>
		<span class="w-4 h-4 ml-1 opacity-50 flex items-center justify-center rounded-md">
			<svg
				class="transition-all duration-300 transform max-w-[16px]"
				class:rotate-90={open}
				xmlns="http://www.w3.org/2000/svg"
				height="24px"
				viewBox="0 0 24 24"
				width="24px"
				fill="#fff"
				><path d="M0 0h24v24H0V0z" fill="none" /><path
					d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"
				/></svg
			>
		</span>
		<span class="flex-1 ml-2 text-left text-sm text-white text-opacity-75">
			{value}
			{$height}
		</span>
	</button>
</div>
<div
	class="transition-all mb-1 flex flex-col"
	style="max-height: {open ? $height : 0}px; overflow: hidden;"
>
	<div use:measureElement={{ height }} class="flex flex-col mx-1">
		{#each children as child, i}
			<div
				class="min-w-[200px - 16px] bg-gray-500 bg-opacity-5 control-{child.name}"
				class:rounded-b-md={i === children.length - 1}
			>
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
</div>
