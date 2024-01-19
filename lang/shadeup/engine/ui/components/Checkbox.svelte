<script lang="ts">
	export let value: boolean;
	export let setValue: (value: boolean) => void = () => {};
</script>

<div class="px-3 pt-0 pb-1 flex flex-row items-center justify-end">
	<button
		on:click={(event) => {
			value = !value;
			setValue(value);
		}}
		class="rounded-md border border-gray-600 bg-gray-900 w-4 h-4 cursor-pointer flex items-center justify-center"
	>
		{#if value}
			<div class="w-2 h-2 rounded-sm bg-purple-600 " />
		{/if}
	</button>
	<input
		style="display: none;"
		hidden
		type="checkbox"
		checked={value}
		on:input={(e) => {
			setValue(e.target.checked);
			value = e.target.checked;
		}}
	/>
</div>

<style lang="scss">
	:global(.control-label + .control-checkbox) {
		margin-top: -1rem;
	}
</style>
