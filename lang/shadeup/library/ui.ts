export namespace ui {
	export function puck(position: float2): float2 {
		return (window as any)._SHADEUP_UI_PUCK(position);
	}

	export function draggable(position: float2, radius: float = 10): float2 {
		return (window as any)._SHADEUP_UI_PUCK(position, radius, true);
	}

	export function textbox(value: string): string {
		return (window as any)._SHADEUP_UI_CONTROL('textbox', value);
	}

	export function slider(value: float, min: float, max: float): float {
		return (window as any)._SHADEUP_UI_SLIDER(value, { min, max });
	}

	export function label(text: string): void {
		return (window as any)._SHADEUP_UI_CONTROL('label', text);
	}

	export function checkbox(value: bool): bool {
		return (window as any)._SHADEUP_UI_CONTROL('checkbox', value);
	}

	export function combo(value: string, options: string[]): string {
		return (window as any)._SHADEUP_UI_CONTROL('combo', value, { options });
	}

	export function group(text: string): void {
		return (window as any)._SHADEUP_UI_CONTROL('group', text);
	}

	export function button(text: string): bool {
		return (window as any)._SHADEUP_UI_CONTROL('button', false, { text });
	}

	export function pop(): void {
		(window as any)._SHADEUP_UI_CONTROL('pop');
	}
}
