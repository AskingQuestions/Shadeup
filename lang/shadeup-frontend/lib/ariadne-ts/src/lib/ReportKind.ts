import { Formatter } from "../data/Formatter";
import { write } from "../write";

/// A type that defines the kind of report being produced.

export class ReportKind {
  constructor(...args: any[]) {}
  fmt(f: Formatter): any {
    if (this instanceof ReportKind.Error)
      return write(f.buf, "Error");
    if (this instanceof ReportKind.Warning)
      return write(f.buf, "Warning");
    if (this instanceof ReportKind.Advice)
      return write(f.buf, "Advice");
    if (this instanceof ReportKind.Custom)
      return write(f.buf, "{}", this.s);
    throw 'invalid ReportKind';
  }
  /// The report is an error and indicates a critical problem that prevents the program performing the requested
  /// action.
  static Error = class Error extends ReportKind { };
  /// The report is a warning and indicates a likely problem, but not to the extent that the requested action cannot
  /// be performed.
  static Warning = class Warning extends ReportKind { };
  /// The report is advice to the user about a potential anti-pattern of other benign issues.
  static Advice = class Advice extends ReportKind { };
  /// The report is of a kind not built into Ariadne.
  static Custom = class Custom extends ReportKind {
    constructor(public s: any, public color: any) {
      super()
    }
  };
}
