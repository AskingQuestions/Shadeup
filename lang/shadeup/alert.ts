export type ShadeupAlert = {
	level: 'info' | 'warning' | 'error';
	message: string;
	location: Number;
	line?: Number;
	column?: Number;
};
