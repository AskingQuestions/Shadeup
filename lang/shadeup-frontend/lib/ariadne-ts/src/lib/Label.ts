import { ColorFn } from "./Color";
import { none, Option, some } from "../data/Option";
import { SpanInit } from "../data/Span";
import { Range } from "../data/Range";

/// A type that represents a labelled section of source code.
export interface Label<S extends Range> {
  span: S;
  msg: Option<string>;
  color: Option<ColorFn>;
  order: number;
  priority: number;
}

export class Label<S> {
  /// Create a new [`Label`].
  constructor(span: S) {
    this.span = span;
    this.msg = none();
    this.color = none();
    this.order = 0;
    this.priority = 0;
  }

  /// Give this label a message.
  with_message(msg: string): this {
    this.msg = some(msg);
    return this;
  }

  /// Give this label a highlight colour.
  with_color(color: ColorFn): this {
    this.color = some(color);
    return this;
  }

  /// Specify the order of this label relative to other labels.
  ///
  /// Lower values correspond to this label having an earlier order.
  ///
  /// If unspecified, labels default to an order of `0`.
  ///
  /// When labels are displayed after a line the crate needs to decide which labels should be displayed first. By
  /// Default, the orders labels based on where their associated line meets the text (see [`LabelAttach`]).
  /// Additionally, multi-line labels are ordered before inline labels. You can this this function to override this
  /// behaviour.
  with_order(order: number): this {
    this.order = order;
    return this;
  }

  /// Specify the priority of this label relative to other labels.
  ///
  /// Higher values correspond to this label having a higher priority.
  ///
  /// If unspecified, labels default to a priority of `0`.
  ///
  /// Label spans can overlap. When this happens, the crate needs to decide which labels to prioritise for various
  /// purposes such as highlighting. By default, spans with a smaller length get a higher priority. You can this this
  /// function to override this behaviour.
  with_priority(priority: number): this {
    this.priority = priority;
    return this;
  }

  last_offset(): number {
    return this.span.end.saturating_sub(1).max(this.span.start)
  }

  static from = Label.new

  static new<S extends Range, Init extends SpanInit>(obj: Init): Label<S> {
    return new Label(Range.from(obj)) as Label<S>
  }

  static is<S extends Range>(other: any): other is Label<S>{
    return other instanceof Label
  }
}
