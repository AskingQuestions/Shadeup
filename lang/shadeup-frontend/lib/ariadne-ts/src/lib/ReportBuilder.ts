import { Option, some } from "../data/Option";
import { Span } from "../data/Span";
import { Config } from "./Config";
import { Label } from "./Label";
import { iReport, Report } from "./Report";
import { ReportKind } from "./ReportKind";

/// A type used to build a [`Report`].

export interface iReportBuilder<S extends Span> {
  kind: ReportKind;
  code: string;
  msg: string;
  note: string;
  help: string;
  location: [S['SourceId'] /* ::Owned */, number];
  labels: Label<S>[];
  config: Config;
}

export class ReportBuilder<S extends Span> {
  constructor(
    private kind: typeof ReportKind,
    private code: Option<string>,
    private msg: Option<string>,
    private note: Option<string>,
    private help: Option<string>,
    private location: [S['SourceId'], number],
    private labels: Label<S>[],
    private config: Config
  ) { }
  /// Give this report a numerical code that may be used to more precisely look up the error in documentation.
  with_code(code: number | string): this {
    this.code = some(code.toString().padStart(2, '0'));
    return this;
  }

  /// Set the message of this report.
  set_message(msg: string) {
    this.msg = some(msg);
  }

  /// Add a message to this report.
  with_message(msg: string): this {
    this.msg = some(msg);
    return this;
  }

  /// Set the note of this report.
  set_note(note: string) {
    this.note = some(note);
  }

  /// Set the note of this report.
  with_note(note: string): this {
    this.set_note(note);
    return this;
  }

  /// Set the help message of this report.
  set_help(note: string) {
    this.help = some(note);
  }

  /// Set the help message of this report.
  with_help(note: string): this {
    this.set_help(note);
    return this;
  }

  /// Add a label to the report.
  add_label(label: Label<S>) {
    this.labels.push(label);
  }

  /// Add multiple labels to the report.
  add_labels(labels: Label<S>[]) {
    this.labels.push(...labels);
  }

  /// Add a label to the report.
  with_label(label: Label<S>): this {
    this.add_label(label);
    return this;
  }

  /// Use the given [`Config`] to determine diagnostic attributes.
  with_config(config: Config): this {
    this.config = config;
    return this;
  }

  /// Finish building the [`Report`].
  finish(): iReport<S> {
    const r = new Report<S>(
      this.kind,
      this.code,
      this.msg,
      this.note,
      this.help,
      this.location,
      this.labels,
      this.config
    );
    return r;
  }
}
