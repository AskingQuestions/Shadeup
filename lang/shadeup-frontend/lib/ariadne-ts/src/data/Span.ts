import { isNumber, isString, range } from "../utils";
import { Range } from "./Range";

export type SpanInit = [src: string, range: Range] | [start: number, end: number];

export class Span {
  constructor(
    private _start: number,
    private _end: number,
  ) {}
  /// The identifier used to uniquely refer to a source. In most cases, this is the fully-qualified path of the file.
  SourceId: any;

  /// Get the identifier of the source that this span refers to.
  source() { return this.SourceId }

  set start(value: number) { this._start = value };
  get start(): number { return this._start };
  set end(value: number) { this._end = value };
  get end(): number { return this._end };

  /// Get the length of this span (difference between the start of the span and the end of the span).
  len(): number {
    return this.end.saturating_sub(this.start)
  };

  /// Determine whether the span contains the given offset.
  contains(offset: number): boolean {
    return range(this.start, this.end).includes(offset);
  };

  static is = (o: any): o is Span => o instanceof Span

  static from(o: SpanInit) {
    if (isNumber(o[0]) && isNumber(o[1]))
      return new Span(o[0], o[1])

    if (isString(o[0]) && Range.is(o[1])) {
      const s = new Span(o[1].start, o[1].end);
      s.SourceId = o[0]
      return s
    }

    throw new Error(`Invalid SpanInit`)
  }
}

export const isSpan = Span.is
