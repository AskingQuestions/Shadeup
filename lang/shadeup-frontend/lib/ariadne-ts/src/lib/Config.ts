import { ColorFn, colors, Fixed } from "./Color";
import { Display } from "../data/Display";
import { Option, some } from "../data/Option";

export class Config {

  constructor(
    public cross_gap: boolean,
    public label_attach: LabelAttach,
    public compact: boolean,
    public underlines: boolean,
    public multiline_arrows: boolean,
    public color: boolean,
    public tab_width: number,
    public char_set: CharSet
  ) { }

  static default(): Config {
    return new Config(
      true,
      LabelAttach.Middle,
      false,
      true,
      true,
      true,
      4,
      CharSet.Unicode
    );
  }

  /// When label lines cross one-another, should there be a gap?
  ///
  /// The alternative to this is to insert crossing characters. However, these interact poorly with label colours.
  ///
  /// If unspecified, this defaults to [`false`].
  with_cross_gap(cross_gap: boolean): this {
    this.cross_gap = cross_gap;
    return this;
  }
  /// Where should inline labels attach to their spans?
  ///
  /// If unspecified, this defaults to [`LabelAttach.Middle`].
  with_label_attach(label_attach: LabelAttach): this {
    this.label_attach = label_attach;
    return this;
  }
  /// Should the report remove gaps to minimise used space?
  ///
  /// If unspecified, this defaults to [`false`].
  with_compact(compact: boolean): this {
    this.compact = compact;
    return this;
  }
  /// Should underlines be used for label span where possible?
  ///
  /// If unspecified, this defaults to [`true`].
  with_underlines(underlines: boolean): this {
    this.underlines = underlines;
    return this;
  }
  /// Should arrows be used to point to the bounds of multi-line spans?
  ///
  /// If unspecified, this defaults to [`true`].
  with_multiline_arrows(multiline_arrows: boolean): this {
    this.multiline_arrows = multiline_arrows;
    return this;
  }
  /// Should colored output should be enabled?
  ///
  /// If unspecified, this defaults to [`true`].
  with_color(color: boolean): this {
    this.color = color;
    return this;
  }
  /// How many characters width should tab characters be?
  ///
  /// If unspecified, this defaults to `4`.
  with_tab_width(tab_width: number): this {
    this.tab_width = tab_width;
    return this;
  }
  /// What character set should be used to display dynamic elements such as boxes and arrows?
  ///
  /// If unspecified, this defaults to [`CharSet.Unicode`].
  with_char_set(char_set: CharSet): this {
    this.char_set = char_set;
    return this;
  }

  error_color(): Option<ColorFn> {
    return some(colors.red).filter(() => this.color);
  }
  warning_color(): Option<ColorFn> {
    return some(colors.yellow).filter(() => this.color);
  }
  advice_color(): Option<ColorFn> {
    return some(Fixed(147)).filter(() => this.color);
  }
  margin_color(): Option<ColorFn> {
    return some(Fixed(246)).filter(() => this.color);
  }
  unimportant_color():Option<ColorFn> {
    return some(Fixed(249)).filter(() => this.color);
  }
  note_color(): Option<ColorFn> {
    return some(Fixed(115)).filter(() => this.color);
  }

  // Find the character that should be drawn and the number of times it should be drawn for each char
  char_width(c: string, col: number): [Display, number] {
    if (c === '\t') {
      // Find the column that the tab should end at
      let tab_end = (col / this.tab_width + 1) * this.tab_width;
      return [new Display(' '), tab_end - col];
    }
    if (c.match(/[\s]/))
      return [new Display(' '), 1];
    return [new Display(c), 1];
  }
}

/// The attachment point of inline label arrows
export enum LabelAttach {
  /// Arrows should attach to the start of the label span.
  Start = 'Start',
  /// Arrows should attach to the middle of the label span (or as close to the middle as we can get).
  Middle = 'Middle',
  /// Arrows should attach to the end of the label span.
  End = 'End'
}

/// Possible character sets to use when rendering diagnostics.
export enum CharSet {
  /// Unicode characters (an attempt is made to use only commonly-supported characters).
  Unicode = 'Unicode',
  /// ASCII-only characters.
  Ascii = 'Ascii'
}
