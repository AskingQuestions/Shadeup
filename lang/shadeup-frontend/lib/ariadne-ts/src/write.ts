import sf from './stringFormat.js';
import { Display, isDisplay } from './data/Display';
import { stringFormatter } from './data/Formatter';
import { isOption, Option } from './data/Option';
import { isResult, Result } from './data/Result';
import { Write } from './data/Write';
import { isShow, Show } from './data/Show';

export type Displayable<T = any, E = any> =
	| Display
	| Show
	| Option<T>
	| Result<T, E>
	| string
	| number;

export function write<W extends Write>(w: W, ...args: Displayable[]) {
	w.write_fmt(format(...args.map(fromRust)));
}

export function format(...args: Displayable[]): string {
	const [head, ...rest] = args.map(fromRust);
	return sf(head, ...rest);
}

function fromRust(node: Displayable): string {
	if (isDisplay(node)) {
		return node.display();
	}
	if (isShow(node)) {
		let f = stringFormatter();
		node.fmt(f);
		return f.unwrap();
	}
	if (isOption(node)) {
		return node.unwrap_or_else(() => '') as string;
	}
	if (isResult(node)) {
		return node.unwrap_or_else(() => '<(Unwrap Err)>');
	}
	return node.toString();
}

export function writeln<W extends Write>(w: W, ...args: Displayable[]) {
	let val = format(...args.map(fromRust));
	w.write_fmt(val);
	w.write_fmt('\n');
}

export function eprintln(...args: Displayable[]): void {
	console.error(format(...args));
}
