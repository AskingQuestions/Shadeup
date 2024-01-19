<script lang="ts">
	export let value: string;
	export let setValue: (value: string) => void = () => {};
</script>

<div class="px-3 pt-0 pb-1">
	<input
		class="outline-none border border-gray-600 bg-gray-800 bg-opacity-30 p-0.5 px-1 text-sm w-full rounded-md"
		type="text"
		{value}
		on:input={(e) => {
			setValue(e.target.value);
			value = e.target.value;
		}}
	/>
</div>
