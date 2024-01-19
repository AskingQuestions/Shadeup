<script lang="ts">
	export let text: string;
	export let setValue: (value: boolean) => void = () => {};
</script>

<div class="px-3 pt-0 pb-1 flex">
	<button
		on:click={(event) => {
			setValue(true);
		}}
		class="rounded-md hover:border-purple-600 border border-gray-600 bg-gray-900 w-full cursor-pointer flex items-center justify-center"
	>
		{text}
	</button>
</div>
