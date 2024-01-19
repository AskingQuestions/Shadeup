<script lang="ts">
	import type { SvelteComponent } from 'svelte';
	import FloatingPanel from './FloatingPanel.svelte';
	import './host.scss';
	import type { UIChild } from '../puck';

	export let children: UIChild[];
</script>

<div class="host">
	{#each children as child}
		<svelte:component
			this={child.type}
			value={child.value}
			setValue={child.setValue}
			children={child.children}
			{...child.options}
		/>
	{/each}
</div>
