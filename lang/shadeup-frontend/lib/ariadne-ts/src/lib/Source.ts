import assert from 'assert';

import { Display } from '../data/Display';
import { none, Option, some } from '../data/Option';
import { err, ok, Result } from '../data/Result';
import { Span } from '../data/Span';
import { Range } from '../data/Range';
import { binary_search_by_key } from '../utils';
import { Displayable, format } from '../write';

export type ErrMsg = string;

export type CacheInit = [id: string, source: Source] | Source | FnCache<string, any>;

/// A trait implemented by [`Source`] caches.
export abstract class Cache<Id> {
	/// Fetch the [`Source`] identified by the given ID, if possible.
	abstract fetch(id: Id): Result<Source, ErrMsg>;

	/// Display the given ID. as a single inline value.
	///
	/// This function may make use of attributes from the [`Fmt`] trait.
	abstract display(id: Id): Option<Displayable>;

	static from(init: CacheInit) {
		if (Source.is(init)) return init;
		if (FnCache.is(init)) return init;
		const [id, source] = init;
		return new IdSource(source.lines(), source.len(), init);
	}
}

/// A type representing a single line of a [`Source`].
class Line {
	constructor(private _offset: number, private _len: number, private _chars: string) {}
	/// Get the offset of this line in the original [`Source`] (i.e: the number of characters that precede it).
	offset(): number {
		return this._offset;
	}

	/// Get the character length of this line.
	len(): number {
		return this._len;
	}

	/// Get the offset span of this line in the original [`Source`].
	span(): Range {
		return new Range(this.offset(), this.offset() + this.len());
	}

	/// Return an iterator over the characters in the line, excluding trailing whitespace.
	chars(): string {
		return this._chars;
	}
}

/// A type representing a single source that may be referred to by [`Span`]s.
///
/// In most cases, a source is a single input file.
export class Source implements Cache<string> {
	constructor(private _lines: Line[], private _len: number) {}

	/// Generate a [`Source`] from the given [`str`].
	///
	/// Note that this function can be expensive for long strings. Use an implementor of [`Cache`] where possible.
	static from(s: string, ...args: any[]): Source {
		let offset = 0;
		const lines = s
			.split('\n') // TODO: Handle non-\n newlines
			.map((line) => {
				let l = new Line(
					offset,
					line.length + 1, // line.chars().count() + 1,
					line.trimEnd()
				);
				offset += l.len();
				return l;
			});

		return new Source(lines, offset);
	}
	/// Get the length of the total number of characters in the source.
	len(): number {
		return this._len;
	}

	/// Return an iterator over the characters in the source.
	chars(): string {
		return this.lines()
			.map((l) => l.chars())
			.flat() as any; // TODO
	}

	/// Get access to a specific, zero-indexed [`Line`].
	line(idx: number): Option<Line> {
		const line = this.lines()[idx];
		return line === undefined ? none() : some(line);
	}

	/// Return an iterator over the [`Line`]s in this source.
	lines(): Line[] {
		return this._lines;
	}

	/// Get the line that the given offset appears on, and the line/column numbers of the offset.
	///
	/// Note that the line/column numbers are zero-indexed.
	get_offset_line(offset: number): Option<[Line, number, number]> {
		if (offset <= this.len()) {
			let idx = binary_search_by_key(this.lines(), offset, (line) => line.offset()).unwrap_or_else(
				(idx) => Math.max(0, (idx as any).saturating_sub(1))
			);
			let line = this.lines()[idx];
			assert(
				line && offset >= line.offset(),
				format('offset = {}, line.offset = {}, idx = {}', offset, line?.offset() ?? Infinity, idx)
			);
			const os = line.offset();
			return some([line, idx, offset - os]);
		} else {
			return none();
		}
	}

	/// Get the range of lines that this span runs across.
	///
	/// The resulting range is guaranteed to contain valid line indices (i.e: those that can be used for
	/// [`Source::line`]).
	get_line_range(span: Span): Range {
		let start = this.get_offset_line(span.start).map_or(0, ([_, l, __]) => l);
		let end = this.get_offset_line((span.end as any).saturating_sub(1).max(span.start)).map_or(
			this.lines().length,
			([_, l, __]) => l + 1
		);
		// start..end
		return new Range(start, end);
	}

	fetch(_: any): Result<Source, ErrMsg> {
		return ok(this);
	}
	display(_: any): Option<Displayable> {
		return none();
	}

	static is(other: any): other is Source {
		return other instanceof Source;
	}
}

export class IdSource extends Source {
	constructor(_lines: Line[], _len: number, public data: [id: string, source: Source]) {
		super(_lines, _len);
	}
	fetch(id: string): Result<Source, ErrMsg> {
		return id === this.data[0] ? ok(this.data[1]) : err(format("Failed to fetch source '{}'", id));
	}
	display(id: string): Option<Display> {
		return some(new Display(id));
	}
}

type PathBuf = {};
type Path = {
	to_path_buf(): PathBuf;
	display(): Option<Display>;
	toString(): string;
};

/// A [`Cache`] that fetches [`Source`]s from the filesystem.
export class FileCache implements Cache<Path> {
	constructor(public files: Map<PathBuf, Source>) {}

	static default(): FileCache {
		return new FileCache(new Map() /* HashMap::default() */);
	}

	fetch(path: Path): Result<Source, ErrMsg> {
		const entry = this.files.get(path.to_path_buf());
		if (entry !== undefined) return ok(entry);

		const source = Source.from('');
		this.files.set(path.to_path_buf(), source);
		return ok(source);
	}
	display(path: Path): Option<Displayable> {
		return path.display();
	}

	static is(other: any): other is FileCache {
		return other instanceof FileCache;
	}
}

/// A [`Cache`] that fetches [`Source`]s using the provided function.
export class FnCache<Id, F extends Function> implements Cache<Id> {
	constructor(public sources: Map<Id, Source>, public get: F) {}

	/// Create a new [`FnCache`] with the given fetch function.
	static new<Id, F extends Function>(get: F): FnCache<Id, F> {
		return new FnCache<Id, F>(new Map() /* HashMap::default() */, get);
	}

	/// Pre-insert a selection of [`Source`]s into this cache.
	with_sources(sources: [Id, Source][]): this {
		// this.sources.reserve(sources.length);
		for (let [id, src] of sources) {
			this.sources.set(id, src);
		}
		return this;
	}
	fetch(id: any): Result<Source, ErrMsg> {
		const entry = this.sources.get(id);
		if (entry !== undefined) return ok(entry);

		const source = Source.from(this.get(id));
		this.sources.set(id, source);
		return ok(source);
	}
	display(id: any): Option<Displayable> {
		return some(id);
	}

	static is(other: any): other is FnCache<any, any> {
		return other instanceof FnCache;
	}
}

/// Create a [`Cache`] from a collection of ID/strings, where each corresponds to a [`Source`].
export function sources<Id extends string, S, I extends Array<[string, string]>>(
	iter: I
): FnCache<any, any> {
	return FnCache.new((id: Id) => format("Failed to fetch source '{}'", id)).with_sources(
		iter.map(([id, s]) => [id, Source.from(s)] as [Id, Source])
	);
}
