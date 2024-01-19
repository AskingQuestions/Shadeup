import assert from 'assert';
import { Display } from '../data/Display';
import { none, Option, some } from '../data/Option';
import { Range } from '../data/Range';
import { Show } from '../data/Show';
import { Span } from '../data/Span';
import { stderrWriter, stdoutWriter, Write } from '../data/Write';
import { CharSet, Config, LabelAttach } from '../lib/Config';
import {
	bton,
	isBoolean,
	isNumber,
	max,
	min_by_key,
	range,
	rangeIter,
	sort_by_key
} from '../utils';
import { eprintln, format, write, writeln } from '../write';
import { Characters, iCharacters } from './Characters';
import { Label } from './Label';
import { LabelInfo, LabelKind } from './LabelInfo';
import { ReportBuilder } from './ReportBuilder';
import { ReportKind } from './ReportKind';
import { Cache, CacheInit } from './Source';
import { SourceGroup } from './SourceGroup';

/// A type representing a diagnostic that is ready to be written to output.

export interface iReport<S extends Span> {
	kind: typeof ReportKind;
	code: Option<string>;
	msg: Option<string>;
	note: Option<string>;
	help: Option<string>;
	location: [S['SourceId'], number];
	labels: Label<S>[];
	config: Config;
	eprint(cache: CacheInit): void;
	print(cache: CacheInit): void;
	printTo(init: CacheInit, writer: Write): void;
}

export class Report<S extends Span> implements iReport<S> {
	constructor(
		public kind: typeof ReportKind,
		public code: Option<string>,
		public msg: Option<string>,
		public note: Option<string>,
		public help: Option<string>,
		public location: [S['SourceId'], number],
		public labels: Label<S>[],
		public config: Config
	) {}

	/// Begin building a new [`Report`].
	static build<S extends Span, Id extends string>(
		kind: typeof ReportKind,
		src_id: Id | null,
		offset: number
	): ReportBuilder<S> {
		// TODO
		const builder = new ReportBuilder<S>(
			kind,
			none(),
			none(),
			none(),
			none(),
			[Option.from(src_id), offset],
			[],
			Config.default()
		);
		return builder;
	}

	/// Write this diagnostic out to `stderr`.
	eprint(init: CacheInit): void {
		const cache = Cache.from(init);
		this.write(cache, stderrWriter);
	}

	/// Write this diagnostic out to `stdout`.
	///
	/// In most cases, [`Report::eprint`] is the
	/// ['more correct'](https://en.wikipedia.org/wiki/Standard_streams#Standard_error_(stderr)) function to use.
	print(init: CacheInit): void {
		const cache = Cache.from(init);
		this.write(cache, stdoutWriter);
	}

	printTo(init: CacheInit, writer: Write): void {
		const cache = Cache.from(init);
		this.write(cache, writer);
	}

	private get_source_groups(cache: Cache<S['SourceId']>): SourceGroup<S>[] {
		let groups: SourceGroup<S>[] = [];
		for (let label of this.labels) {
			let src_display = cache.display(label.span.source());
			let res = cache.fetch(label.span.source());
			if (res.is_err()) {
				console.error("Unable to fetch source '{}': {}", src_display, res.unwrap());
				continue;
			}
			let src = res.unwrap();

			assert(label.span.start <= label.span.end, 'Label start is after its end');

			let start_line = src.get_offset_line(label.span.start).map(([_, l, __]) => l);
			let end_line = src
				.get_offset_line(label.span.end.saturating_sub(1).max(label.span.start))
				.map(([_, l, __]) => l);

			let label_info = new LabelInfo<any>(
				start_line.equal(end_line) ? LabelKind.Inline : LabelKind.Multiline,
				label
			);

			const group = groups.find((g: SourceGroup<S>) => g.src_id === label.span.source());

			if (group) {
				group.span.start = group.span.start.min(label.span.start);
				group.span.end = group.span.end.max(label.span.end);
				group.labels.push(label_info);
			} else {
				groups.push(
					new SourceGroup(label.span.source(), new Range(label.span.start, label.span.end), [
						label_info
					])
				);
			}
		}
		return groups;
	}

	/// Write this diagnostic to an implementor of [`Write`].
	///
	/// If you wish to write to `stderr` or `stdout`, you can do so via [`Report::eprint`] or [`Report::print`] respectively.
	private write<C extends Cache<string>, W extends Write>(cache: C, w: W): void {
		let draw: iCharacters = match(this.config.char_set, [
			[CharSet.Unicode, () => Characters.unicode()],
			[CharSet.Ascii, () => Characters.ascii()]
		]);

		// --- Header ---

		let code = this.code ? format('[E{}] ', this.code) : '';
		let id = format('{}{}:', code, this.kind.name);
		let kind_color = match(this.kind, [
			[ReportKind.Error, () => this.config.error_color()],
			[ReportKind.Warning, () => this.config.warning_color()],
			[ReportKind.Advice, () => this.config.advice_color()],
			[ReportKind.Custom, (kind: any) => kind.color]
		]);

		writeln(w, '{} {}', new Display(id).fg(kind_color), new Show(this.msg));

		let groups = this.get_source_groups(cache);

		// Line number maximum width
		let filtered_groups = groups.filter_map(({ span, src_id }: SourceGroup<S>) => {
			let src_name: string = cache
				.display(src_id)!
				.map((d) => d.toString())
				.unwrap_or_else(() => '<unknown>');

			let res = cache.fetch(src_id);

			if (res.is_err()) {
				eprintln('Unable to fetch source {}: {}', src_name, res.unwrap());
				return null;
			}
			let src = res.unwrap();

			let line_range = src.get_line_range(span);

			let iter = rangeIter(1, Infinity);
			iter = map(iter, (x) => Math.pow(10, x));
			iter = take_while(iter, (x) => {
				const d = Math.floor(line_range.end / x);
				return d !== 0;
			});
			const cnt = count(iter);
			return cnt + 1;
		});

		let line_no_width = max(filtered_groups) ?? 0;

		// --- Source sections ---
		let groups_len = groups.length;
		for (let [group_idx, { src_id, span, labels }] of enumerate(groups)) {
			let src_name = cache
				.display(src_id)
				.map((d) => d.toString())
				.unwrap_or_else(() => '<unknown>');

			let res = cache.fetch(src_id);

			if (res.is_err()) {
				eprintln('Unable to fetch source {}: {}', src_name, res.unwrap());
				continue;
			}

			let src = res.unwrap();

			let line_range = src.get_line_range(span);

			// File name & reference
			let location = src_id === this.location[0] ? this.location[1] : labels[0].label.span.start;

			let [line_no, col_no] = src
				.get_offset_line(location)
				.map(([_, idx, col]) => [format('{}', idx + 1), format('{}', col + 1)])
				.unwrap_or_else(() => ['?', '?']);

			let line_ref = format(':{}:{}', line_no, col_no);
			writeln(
				w,
				'{}{}{}{}{}{}{}',
				new Show([' ', line_no_width + 2]),
				new Display(group_idx === 0 ? draw.ltop : draw.lcross).fg(this.config.margin_color()),
				new Display(draw.hbar).fg(this.config.margin_color()),
				new Display(draw.lbox).fg(this.config.margin_color()),
				src_name,
				line_ref,
				new Display(draw.rbox).fg(this.config.margin_color())
			);

			if (!this.config.compact) {
				writeln(
					w,
					'{}{}',
					new Show([' ', line_no_width + 2]),
					new Display(draw.vbar).fg(this.config.margin_color())
				);
			}

			class LineLabel<S extends Span> {
				constructor(
					public col: number,
					public label: Label<S>,
					public multi: boolean,
					public draw_msg: boolean
				) {
					this.col = Math.floor(col);
				}
			}

			// Generate a list of multi-line labels
			let multi_labels: Label<S>[] = [];
			for (let label_info of labels) {
				if (label_info.kind === LabelKind.Multiline) {
					multi_labels.push(label_info.label);
				}
			}

			// Sort multiline labels by length
			multi_labels.sort((a, b) => b.span.len() - a.span.len());

			//#region [ rgba(0, 20, 0, 0.3) ] Write_Margin
			let write_margin = (
				w: W,
				idx: number,
				is_line: boolean,
				is_ellipsis: boolean,
				draw_labels: boolean,
				report_row: Option<[number, boolean]>,
				line_labels: Array<LineLabel<S>>,
				margin_label: Option<LineLabel<S>>
			): void => {
				let line_no_margin: string;

				if (is_line && !is_ellipsis) {
					let line_no = format('{}', idx + 1);
					line_no_margin = format(
						'{}{} {}',
						new Show([' ', line_no_width - line_no.length]),
						line_no,
						draw.vbar
					);
				} else {
					line_no_margin = format(
						'{}{}',
						new Show([' ', line_no_width + 1]),
						is_ellipsis ? draw.vbar_gap : draw.vbar_break
					);
				}

				write(
					w,
					' {}{}',
					new Display(line_no_margin).fg(this.config.margin_color()),
					new Show(some(' ').filter(() => !this.config.compact))
				);

				// Multi-line margins
				if (draw_labels) {
					for (let col of range(0, multi_labels.length + bton(multi_labels.length > 0))) {
						let corner: Option<[Label<S>, boolean]> = none();
						let hbar: Option<Label<S>> = none();
						let vbar: Option<Label<S>> = none();
						let margin_ptr: Option<[LineLabel<S>, boolean]> = none();

						let multi_label = Option.from(multi_labels[col]);
						let line_span = src.line(idx).unwrap().span();

						for (let [i, label] of enumerate(
							multi_labels.slice(0, (col + 1).min(multi_labels.length))
						)) {
							let margin = margin_label.filter((m) => label === m.label);

							if (label.span.start <= line_span.end && label.span.end > line_span.start) {
								let is_parent = i !== col;
								let is_start = line_span.contains(label.span.start);
								let is_end = line_span.contains(label.last_offset());

								if (margin.filter(() => is_line).is_some()) {
									let _margin = margin.filter(() => is_line);
									margin_ptr = some([_margin.unwrap(), is_start]);
								} else if (!is_start && (!is_end || is_line)) {
									vbar = vbar.or(some(label).filter(() => !is_parent));
								} else {
									if (
										report_row.is_some() &&
										report_row.map_or(false, (o) => isNumber(o[0]) && isBoolean(o[1]))
									) {
										let [_report_row, is_arrow] = report_row.unwrap();

										let label_row: number = Option.from(
											line_labels.enumerate().find(([_, l]) => label === l.label)
										).map_or(0, ([r, _]) => r);

										if (_report_row === label_row) {
											if (margin.is_some()) {
												vbar = some(margin.unwrap().label).filter(() => col === i);
												if (is_start) {
													continue;
												}
											}

											if (is_arrow) {
												hbar = some(label);
												if (!is_parent) {
													corner = some([label, is_start]);
												}
											} else if (!is_start) {
												vbar = vbar.or(some(label).filter(() => !is_parent));
											}
										} else {
											vbar = vbar.or(
												some(label).filter(
													() => !is_parent && !!(bton(is_start) ^ bton(_report_row < label_row))
												)
											);
										}
									}
								}
							}
						}

						if (
							margin_ptr.is_some() &&
							margin_ptr.map_or(false, (o) => Label.is(o[0]) && isBoolean(o[1])) &&
							is_line
						) {
							let [margin, _is_start] = margin_ptr.unwrap();
							if (_is_start) {
								let is_col = multi_label.map_or(false, (ml) => ml === margin.label);
								let is_limit = col + 1 === multi_labels.length;
								if (!is_col && !is_limit) {
									hbar = hbar.or(some(margin.label));
								}
							}
						}

						hbar = hbar.filter(
							(l) => margin_label.map_or(true, (margin) => margin.label !== l) || !is_line
						);

						const getCorners = (): [Display, Display] => {
							if (
								corner.is_some() &&
								Array.isArray(corner.unwrap()) &&
								Label.is(corner.unwrap()[0]) &&
								isBoolean(corner.unwrap()[1])
							) {
								let [label, is_start] = corner.unwrap();
								return [
									new Display(is_start ? draw.ltop : draw.lbot).fg(label.color),
									new Display(draw.hbar).fg(label.color)
								];
							} else if (hbar.filter(() => vbar.is_some() && !this.config.cross_gap).is_some()) {
								let label: Label<S> = hbar
									.filter(() => vbar.is_some() && !this.config.cross_gap)
									.unwrap();
								return [
									new Display(draw.xbar).fg(label.color),
									new Display(draw.hbar).fg(label.color)
								];
							} else if (hbar.is_some()) {
								let label: Label<S> = hbar.unwrap();
								const d = new Display(draw.hbar).fg(label.color);
								return [d, d];
							} else if (vbar.is_some()) {
								let label: Label<S> = vbar.unwrap();
								let vb = new Display(is_ellipsis ? draw.vbar_gap : draw.vbar);
								return [vb.fg(label.color), new Display(' ').fg(none())];
							} else if (margin_ptr.is_some() && is_line) {
								let [margin, is_start] = margin_ptr.unwrap();
								let is_col = multi_label.map_or(false, (ml) => ml === margin.label);
								let is_limit = col === multi_labels.length;
								return [
									new Display(
										is_limit
											? draw.rarrow
											: is_col
											? is_start
												? draw.ltop
												: draw.lcross
											: draw.hbar
									).fg(margin.label.color),

									new Display(!is_limit ? draw.hbar : ' ').fg(margin.label.color)
								];
							} else {
								const d = new Display(' ').fg(none());
								return [d, d];
							}
						};

						let [a, b] = getCorners();

						write(w, '{}', a);
						if (!this.config.compact) {
							write(w, '{}', b);
						}
					}
				}
			};
			// #endregion

			//#region [ rgba(0, 0, 0, 0.3) ] Body
			let is_ellipsis = false;
			for (let idx of range(line_range.start, line_range.end)) {
				if (src.line(idx).is_none()) {
					continue;
				}

				let line = src.line(idx).unwrap();

				const f_labels = multi_labels.enumerate().filter_map(([_i, label]) => {
					let is_start = line.span().contains(label.span.start);
					let is_end = line.span().contains(label.last_offset());
					if (is_start) {
						// TODO: Check to see whether multi is the first on the start line or first on the end line
						return new LineLabel(label.span.start - line.offset(), label, true, false);
					} else if (is_end) {
						return new LineLabel(label.last_offset() - line.offset(), label, true, true);
					} else {
						return null;
					}
				});

				// let margin_label = min_by_key(f_labels, ll => <any>[ll.col, !ll.label.span.start]);
				let margin_label = min_by_key(f_labels, (ll) => ll.col);
				// .min_by_key(ll => [ll.col, !ll.label.span.start]));

				// Generate a list of labels for this line, along with their label columns
				let line_labels = multi_labels.enumerate().filter_map(([_i, label]) => {
					let is_start = line.span().contains(label.span.start);
					let is_end = line.span().contains(label.last_offset());
					if (is_start && margin_label.map_or(true, (m: any) => label !== m.label)) {
						// TODO: Check to see whether multi is the first on the start line or first on the end line
						return new LineLabel(
							label.span.start - line.offset(),
							label,
							true,
							false // Multi-line spans don;t have their messages drawn at the start
						);
					} else if (is_end) {
						return new LineLabel(
							label.last_offset() - line.offset(),
							label,
							true,
							true // Multi-line spans have their messages drawn at the end
						);
					} else {
						return null;
					}
				});

				for (let label_info of labels.filter(
					(l) => l.label.span.start >= line.span().start && l.label.span.end <= line.span().end
				)) {
					if (label_info.kind === LabelKind.Inline) {
						let col = match(this.config.label_attach, [
							[LabelAttach.Start, () => label_info.label.span.start],
							[
								LabelAttach.Middle,
								() => (label_info.label.span.start + label_info.label.span.end) / 2
							],
							[LabelAttach.End, () => label_info.label.last_offset()]
						]);

						line_labels.push(
							new LineLabel(
								col.max(label_info.label.span.start) - line.offset(),
								label_info.label,
								false,
								true
							)
						);
					}
				}

				// Skip this line if we don't have labels for it
				if (line_labels.length === 0 && margin_label.is_none()) {
					let within_label = multi_labels.some((label) => label.span.contains(line.span().start));
					if (!is_ellipsis && within_label) {
						is_ellipsis = true;
					} else {
						if (!this.config.compact && !is_ellipsis) {
							write_margin(w, idx, false, is_ellipsis, false, none(), [], none());
							write(w, '\n');
						}
						is_ellipsis = true;
						continue;
					}
				} else {
					is_ellipsis = false;
				}

				// Sort the labels by their columns
				sort_by_key(line_labels, (ll) => ll.label.order);
				sort_by_key(line_labels, (ll) => ll.col);
				sort_by_key(line_labels, (ll) => bton(!ll.label.span.start));

				// Determine label bounds so we know where to put error messages
				let arrow_end_space = this.config.compact ? 1 : 2;
				let arrow_len =
					line_labels.reduce((l, ll) => {
						return ll.multi ? line.len() : l.max(ll.label.span.end.saturating_sub(line.offset()));
					}, 0) + arrow_end_space;

				// Should we draw a vertical bar as part of a label arrow on this line?
				let get_vbar = (col: number, row: number): Option<LineLabel<S>> =>
					Option.from(
						line_labels
							// Only labels with notes get an arrow
							.enumerate()
							.filter(
								([_, ll]) =>
									ll.label.msg.is_some() && margin_label.map_or(true, (m) => ll.label !== m.label)
							)
							.find(
								([j, ll]) => ll.col === col && ((row <= j && !ll.multi) || (row <= j && ll.multi))
							)
					).map(([_, ll]) => ll);

				let get_highlight = (col: number): Option<Label<S>> =>
					min_by_key(
						margin_label
							.iter()
							.map((ll) => ll.label)
							.chain(multi_labels.map((l) => l))
							.chain(line_labels.map((l) => l.label))
							.filter((l) => l.span.contains(line.offset() + col)),
						// Prioritise displaying smaller spans
						// .min_by_key((l: any) => [-l.priority, l.span.len()]);
						// .min_by_key(l => l.span.len()));
						(l) => -l.priority + l.span.len()
					);
				// l => l.span.len());
				// l => -l.priority);

				let get_underline = (col: number): Option<LineLabel<S>> =>
					min_by_key(
						line_labels.filter((ll: any) => {
							return (
								this.config.underlines &&
								// Underlines only occur for inline spans (highlighting can occur for all spans)
								!ll.multi &&
								ll.label.span.contains(line.offset() + col)
							);
						}),
						// Prioritise displaying smaller spans
						// .min_by_key(ll => [-ll.label.priority, ll.label.span.len()]);
						// .min_by_key(ll => ll.label.span.len()));
						// ll => -ll.label.priority + ll.label.span.len());
						(ll) => ll.label.span.len()
					);
				// ll => -ll.label.priority);

				// Margin
				write_margin(w, idx, true, is_ellipsis, true, none(), line_labels, margin_label);

				// Line
				if (!is_ellipsis) {
					for (let [col, _c] of enumerate(line.chars() as any as string[])) {
						let highlight = get_highlight(col);
						let color = highlight.is_some()
							? highlight.unwrap().color
							: this.config.unimportant_color();
						let [c, width] = this.config.char_width(_c, col);
						for (let _ of range(0, width)) {
							write(w, '{}', new Display(c).fg(color));
						}
					}
				}
				write(w, '\n');

				// Arrows !!!
				for (let row of range(0, line_labels.length)) {
					let line_label = line_labels[row];

					if (!this.config.compact) {
						// Margin alternate
						write_margin(
							w,
							idx,
							false,
							is_ellipsis,
							true,
							some([row, false]),
							line_labels,
							margin_label
						);
						// Lines alternate
						let chars = line.chars();

						let { next } = makeIter(chars);

						for (let col of range(0, arrow_len)) {
							let width = next().map_or(1, (c) => this.config.char_width(c, col)[1]);

							let vbar = get_vbar(col, row);
							let underline = get_underline(col).filter(() => row === 0);

							const getCTailOuter = () => {
								if (vbar.is_some()) {
									let vbar_ll = vbar.unwrap();

									const getCTailInner = () => {
										if (underline.is_some()) {
											// TODO: Is this good?
											if (vbar_ll.label.span.len() <= 1) {
												return [draw.underbar, draw.underline];
											} else if (line.offset() + col === vbar_ll.label.span.start) {
												return [draw.ltop, draw.underbar];
											} else if (line.offset() + col === vbar_ll.label.last_offset()) {
												return [draw.rtop, draw.underbar];
											} else {
												return [draw.underbar, draw.underline];
											}
										} else if (vbar_ll.multi && row === 0 && this.config.multiline_arrows) {
											return [draw.uarrow, new Display(' ')];
										} else {
											return [draw.vbar, new Display(' ')];
										}
									};

									let [c, tail] = getCTailInner();
									return [
										new Display(c).fg(vbar_ll.label.color),
										new Display(tail).fg(vbar_ll.label.color)
									];
								} else if (underline.is_some()) {
									let underline_ll = underline.unwrap();
									return [
										new Display(draw.underline).fg(underline_ll.label.color),
										new Display(draw.underline).fg(underline_ll.label.color)
									];
								} else {
									return [new Display(' ').fg(none()), new Display(' ').fg(none())];
								}
							};

							let [c, tail] = getCTailOuter();
							for (let i of range(0, width)) {
								write(w, '{}', i === 0 ? c : tail);
							}
						}
						write(w, '\n');
					}

					// Margin
					write_margin(
						w,
						idx,
						false,
						is_ellipsis,
						true,
						some([row, true]),
						line_labels,
						margin_label
					);
					// Lines
					let chars = line.chars();
					let { next } = makeIter(chars);

					for (let col of range(0, arrow_len)) {
						let n = next();
						let width = n.map_or(1, (c) => this.config.char_width(c, col)[1]);

						let is_hbar =
							((col > line_label.col ? 1 : 0) ^ (line_label.multi ? 1 : 0) ||
								(line_label.label.msg.is_some() && line_label.draw_msg && col > line_label.col)) &&
							line_label.label.msg.is_some();

						const getctail = (): [any, any] => {
							if (
								col === line_label.col &&
								line_label.label.msg.is_some() &&
								margin_label.map_or(true, (m) => line_label.label != m.label)
							) {
								return [
									new Display(
										line_label.multi ? (line_label.draw_msg ? draw.mbot : draw.rbot) : draw.lbot
									).fg(line_label.label.color),

									new Display(draw.hbar).fg(line_label.label.color)
								];
							} else if (
								get_vbar(col, row)
									.filter(() => col != line_label.col || line_label.label.msg.is_some())
									.is_some()
							) {
								let vbar_ll = get_vbar(col, row)
									.filter(() => col != line_label.col || line_label.label.msg.is_some())
									.unwrap();
								if (!this.config.cross_gap && is_hbar) {
									return [
										new Display(draw.xbar).fg(line_label.label.color),
										new Display(' ').fg(line_label.label.color)
									];
								} else if (is_hbar) {
									let d = new Display(draw.hbar).fg(line_label.label.color);
									return [d, d];
								} else {
									return [
										new Display(
											vbar_ll.multi && row === 0 && this.config.compact ? draw.uarrow : draw.vbar
										).fg(vbar_ll.label.color),

										new Display(' ').fg(line_label.label.color)
									];
								}
							} else if (is_hbar) {
								let d = new Display(draw.hbar).fg(line_label.label.color);
								return [d, d];
							} else {
								let d = new Display(' ').fg(none());
								return [d, d];
							}
						};

						let [c, tail] = getctail();

						if (width > 0) {
							write(w, '{}', c);
						}
						for (let _ of range(1, width)) {
							write(w, '{}', tail);
						}
					}
					if (line_label.draw_msg) {
						write(w, ' {}', new Show(line_label.label.msg));
					}

					write(w, '\n');
				}
			}
			//#endregion

			let is_final_group = group_idx + 1 === groups_len;

			// Help
			if (this.help.is_some() && is_final_group) {
				let note = this.help.unwrap();
				if (!this.config.compact) {
					write_margin(w, 0, false, false, true, some([0, false]), [], none());
					write(w, '\n');
				}
				write_margin(w, 0, false, false, true, some([0, false]), [], none());
				write(w, '{}: {}\n', new Display('Help').fg(this.config.note_color()), note);
			}

			// Note
			if (this.note.is_some() && is_final_group) {
				let note = this.note.unwrap();
				if (!this.config.compact) {
					write_margin(w, 0, false, false, true, some([0, false]), [], none());
					write(w, '\n');
				}
				write_margin(w, 0, false, false, true, some([0, false]), [], none());
				write(w, '{}: {}\n', new Display('Note').fg(this.config.note_color()), note);
			}

			// Tail of report
			if (!this.config.compact) {
				if (is_final_group) {
					let final_margin = format('{}{}', new Show([draw.hbar, line_no_width + 2]), draw.rbot);
					writeln(w, '{}', new Display(final_margin).fg(this.config.margin_color()));
				} else {
					writeln(
						w,
						'{}{}',
						new Show([' ', line_no_width + 2]),
						new Display(draw.vbar).fg(this.config.margin_color())
					);
				}
			}
		}

		if (groups_len === 0) {
			// Help
			if (this.help.is_some()) {
				let note = this.help.unwrap();
				if (!this.config.compact) {
					write(w, '\n');
				}
				write(w, '{}: {}\n', new Display('Help').fg(this.config.note_color()), note);
			}

			// Note
			if (this.note.is_some()) {
				let note = this.note.unwrap();
				if (!this.config.compact) {
					write(w, '\n');
				}
				write(w, '{}: {}\n', new Display('Note').fg(this.config.note_color()), note);
			}
		}
	}
}

type MatchResult<T> = T extends abstract new (...args: any) => infer RT ? RT : T;

function match<T, R>(kind: T, matchers: [T, (arg: MatchResult<T>) => R][]): R {
	for (let [type, then] of matchers) {
		// TODO: fixme .. this is a hack
		if (<any>kind === type) return then(kind as any);
	}
	return null as any;
}

function* enumerate<T>(groups: T[]) {
	for (let i = 0; i < groups.length; i++) yield [i, groups[i]] as [number, T];
	return;
}

function* map<a, b>(a: Iterator<a>, f: (a: a) => b) {
	let value = a.next();
	while (value.done === false) {
		yield f(value.value);
		value = a.next();
	}
}

function* take_while<a>(a: Iterator<a>, p: (a: a) => boolean) {
	let current = a.next();
	while (current.done === false) {
		if (p(current.value)) yield current.value;
		else break;
		current = a.next();
	}
}

function to_array<a>(a: Iterator<a>) {
	let result: a[] = [];
	let current = a.next();
	while (current.done === false) {
		result.push(current.value);
		current = a.next();
	}
	return result;
}

function count<a>(a: Iterator<a>) {
	return to_array(a).length;
}

function makeIter<T extends any[] | string>(arr: T) {
	let cursor = 0;
	let next = (): Option<string> => {
		const res = arr[cursor++];
		if (res === undefined) return none();
		return some(res);
	};

	return { next, cursor };
}
