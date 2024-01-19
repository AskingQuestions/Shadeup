<script lang="ts">
	export let value: number;
	export let min: number;
	export let max: number;
	export let setValue: (value: number) => void = () => {};

	let dragging = false;

	let selfElement: HTMLDivElement;

	function handleMove(e: MouseEvent) {
		if (dragging) {
			const rect = selfElement.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percent = x / rect.width;
			let newValue = min + (max - min) * percent;
			newValue = Math.max(min, Math.min(max, newValue));
			setValue(newValue);
			value = newValue;
		}
	}
</script>

<svelte:window on:mouseup={() => (dragging = false)} on:mousemove={handleMove} />

<div class="px-3 pt-0 pb-1 flex flex-row items-center">
	<div
		bind:this={selfElement}
		on:mousedown={(event) => {
			dragging = true;
			handleMove(event);
		}}
		class="track w-full h-4 relative flex items-center"
	>
		<div class="absolute rounded-full bg-gray-600 w-full h-1" />
		<div
			class="handle absolute w-[6px] h-[14px] rounded-full bg-purple-600 cursor-pointer"
			style="left: calc(100% * {value - min} / {max - min} - 3px);"
		/>
	</div>
	<input
		class="bg-black bg-opacity-10 p-0 rounded-sm w-5 h-4 text-sm outline-none border-none ml-2 text-right"
		style="font-size: 10px;"
		type="text"
		value={value.toFixed(1).replace(/\.0$/, '')}
		{min}
		{max}
		on:input={(e) => {
			setValue(parseFloat(e.target.value));
			value = parseFloat(e.target.value);
		}}
	/>
	<input
		hidden
		type="range"
		{min}
		{max}
		{value}
		on:input={(e) => {
			setValue(parseFloat(e.target.value));
			value = parseFloat(e.target.value);
		}}
	/>
</div>
