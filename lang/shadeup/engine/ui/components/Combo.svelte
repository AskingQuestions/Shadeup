<script lang="ts">
	export let value: string;
	export let options: string[];
	export let setValue: (value: boolean) => void = () => {};
</script>

<div class="px-3 pt-0 pb-1 flex flex-row items-center justify-end">
	<select
		class="border border-gray-600 outline-none rounded-md text-sm p-0.5 px-1 bg-gray-800 bg-opacity-30 w-full"
		on:input={(e) => {
			setValue(e.target.value);
			value = e.target.value;
		}}
	>
		{#if typeof options == 'object' && Array.isArray(options)}
			{#each options as option}
				<option class="bg-gray-800" selected={value == option} value={option}>{option}</option>
			{/each}
		{/if}
	</select>
</div>
