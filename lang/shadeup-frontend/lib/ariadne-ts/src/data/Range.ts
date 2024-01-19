import { isNumber, isString } from '../utils';
import { Span, SpanInit } from './Span';

export class Range extends Span {
	public SourceId: any = null;

	public source(): any {
		return this.SourceId;
	}

	public len(): number {
		return Math.abs(this.start - this.end);
	}
	public contains(item: any): boolean {
		return item >= this.start && item < this.end;
	}

	static is(o: any): o is Range {
		return o instanceof Range;
	}

	static from(o: SpanInit): Range {
		if (isNumber(o[0]) && isNumber(o[1])) return new Span(o[0], o[1]);

		if (isString(o[0]) && Range.is(o[1])) {
			const s = new Range(o[1].start, o[1].end);
			s.SourceId = o[0];
			return s;
		}

		throw new Error(`Invalid SpanInit`);
	}

	static new(start: number, end: number): Span {
		return new Range(start, end);
	}
}
