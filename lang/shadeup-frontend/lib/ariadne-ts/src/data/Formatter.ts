import { none, type Option } from './Option';
import { mkStringWriter, type Write, StdoutWriter } from './Write';

export enum Alignment {
	Left = 'Left',
	Right = 'Right',
	Center = 'Center'
}

export interface Formatter {
	flags: number;
	fill: string;
	align: Alignment;
	width: Option<number>;
	precision: Option<number>;
	buf: Write | null;
}

export const formatter = new (class implements Formatter {
	flags: number = 0;
	fill: string = '';
	align: Alignment = Alignment.Left;
	width: Option<number> = none();
	precision: Option<number> = none();
	buf: Write | null = null;
})();

// formatter.buf = new StdoutWriter();

export const stringFormatter = () =>
	new (class implements Formatter {
		flags: number = 0;
		fill: string = '';
		align: Alignment = Alignment.Left;
		width: Option<number> = none();
		precision: Option<number> = none();
		buf = mkStringWriter();
		unwrap() {
			return this.buf.unwrap();
		}
	})();
