type GraphicsAdapter = {
	drawImage(image: HTMLCanvasElement): void;
	addEventListener(name: string, fn: (...args: any) => void): void;
	activatePaintContext(): void;
};
import type { float4, float2 } from './types';

export class PaintingContext {
	markDirtyCallback: () => void = () => {};
	constructor(canvas: HTMLCanvasElement, gl: GraphicsAdapter | null) {
		if (!gl) return;
		this.__gl = gl;
		this.__canvas = canvas;
		this.__offscreen_canvas = document.createElement('canvas');
		this.__offscreen_canvas.width = canvas.width;
		this.__offscreen_canvas.height = canvas.height;
		// document.body.appendChild(this.__offscreen_canvas);
		this.__ctx = this.__offscreen_canvas.getContext('2d', {
			willReadFrequently: true
		})!;
		this.__offscreen_canvas.style.position = 'absolute';
		this.__offscreen_canvas.style.zIndex = '10';
		// document.body.appendChild(this.__offscreen_canvas);
		this.__setColor([0, 0, 0, 1] as float4);

		gl.addEventListener('context', (toContext: string) => {
			if (toContext == 'draw') {
				this.flush();
			}
		});

		gl.addEventListener('flush', () => {
			this.flush();
		});
	}

	flush() {
		if (!this.__gl) return;
		if (!this.__canvas) return;
		if (!this.__offscreen_canvas) return;

		if (!this.stagedChanges) return;

		if (this.fastPoints) this.flushPoints();

		this.__gl.drawImage(this.__offscreen_canvas);
		this.stagedChanges = false;

		if (
			this.__offscreen_canvas.width != this.__canvas.width ||
			this.__offscreen_canvas.height != this.__canvas.height
		) {
			this.__offscreen_canvas.width = this.__canvas.width;
			this.__offscreen_canvas.height = this.__canvas.height;
		}

		this.pointsCounter = 0;
	}

	private __ctx: CanvasRenderingContext2D | null = null;
	private __gl: GraphicsAdapter | null = null;
	private __offscreen_canvas: HTMLCanvasElement | null = null;

	private __program: WebGLProgram | null = null;

	private stagedChanges: boolean = false;
	private dirty: boolean = false;

	private fastPoints: boolean = false;
	private fastPointsBuffer: ImageData | null = null;

	private __beforeDraw() {
		if (!this.__offscreen_canvas) return;
		if (!this.__ctx) return;
		if (!this.__canvas) return;
		this.markDirtyCallback();
		this.__gl?.activatePaintContext();

		if (!this.stagedChanges) {
			this.__ctx.clearRect(0, 0, this.__canvas.width, this.__canvas.height);

			this.__ctx.drawImage(this.__canvas, 0, 0);

			let color = this.__currentColor;
			this.__ctx.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
				color[3]
			})`;
			this.__ctx.strokeStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
				color[3]
			})`;
		}
	}

	private __afterDraw() {
		let gl = this.__gl;
		this.dirty = true;
		this.stagedChanges = true;
	}

	private __currentColor: number[] | null = null;
	private __setColor(color?: float4) {
		if (!this.__ctx || !color) return;

		if (
			this.__currentColor &&
			this.__currentColor[0] == color[0] &&
			this.__currentColor[1] == color[1] &&
			this.__currentColor[2] == color[2] &&
			this.__currentColor[3] == color[3]
		)
			return;

		this.__ctx.strokeStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
			color[3]
		})`;
		this.__ctx.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
			color[3]
		})`;

		this.__currentColor = [color[0], color[1], color[2], color[3]];
	}

	fillRect(pos: float2, size: float2, color?: float4) {
		if (!this.__ctx) return;

		this.flushPoints();
		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.fillRect(pos[0], pos[1], size[0], size[1]);

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	fillCircle(pos: float2, radius: number, color?: float4) {
		if (!this.__ctx) return;

		this.flushPoints();
		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.beginPath();
		this.__ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
		this.__ctx.fill();

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	fillArc(pos: float2, radius: number, startAngle: number, endAngle: number, color?: float4) {
		if (!this.__ctx) return;

		this.flushPoints();
		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.beginPath();
		this.__ctx.arc(pos[0], pos[1], radius, startAngle, endAngle);
		this.__ctx.fill();

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	line(pos1: float2, pos2: float2, color?: float4, width: number = 1) {
		if (!this.__ctx) return;

		this.flushPoints();
		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.beginPath();
		this.__ctx.moveTo(pos1[0], pos1[1]);

		this.__ctx.lineTo(pos2[0], pos2[1]);
		this.__ctx.lineWidth = width;
		this.__ctx.stroke();

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	circle(pos: float2, radius: number, color?: float4, width: number = 1) {
		if (!this.__ctx) return;

		this.flushPoints();
		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.beginPath();
		this.__ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
		this.__ctx.lineWidth = width;
		this.__ctx.stroke();

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	arc(
		pos: float2,
		radius: number,
		startAngle: number,
		endAngle: number,
		color?: float4,
		width: number = 1
	) {
		if (!this.__ctx) return;

		this.flushPoints();
		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.beginPath();
		this.__ctx.arc(pos[0], pos[1], radius, startAngle, endAngle);
		this.__ctx.lineWidth = width;
		this.__ctx.stroke();

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	text(pos: float2, text: string, color?: float4) {
		if (!this.__ctx) return;

		this.flushPoints();
		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.fillText(text, pos[0], pos[1]);

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	startPath(pos: float2) {
		if (!this.__ctx) return;

		this.flushPoints();
		this.__beforeDraw();

		this.__ctx.beginPath();
		this.__ctx.moveTo(pos[0], pos[1]);
	}

	lineTo(pos: float2) {
		if (!this.__ctx) return;

		this.__ctx.lineTo(pos[0], pos[1]);
	}

	strokePath(color?: float4, width: number = 1) {
		if (!this.__ctx) return;

		this.__ctx.lineWidth = width;
		this.__setColor(color);
		this.__ctx.stroke();

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	fillPath(color?: float4) {
		if (!this.__ctx) return;

		this.__setColor(color);
		this.__ctx.fill();

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	setStrokeWidth(width: number) {
		if (!this.__ctx) return;

		this.__ctx.lineWidth = width;
	}

	setFont(font: string) {
		if (!this.__ctx) return;

		this.__ctx.font = font;
	}

	setFontSize(size: number) {
		if (!this.__ctx) return;

		this.__ctx.font = `${size}px ${this.__ctx.font.split(' ').slice(1).join(' ')}`;
	}

	setTextAlign(align: CanvasTextAlign) {
		if (!this.__ctx) return;

		this.__ctx.textAlign = align;
	}

	setTextBaseline(baseline: CanvasTextBaseline) {
		if (!this.__ctx) return;

		this.__ctx.textBaseline = baseline;
	}

	setLineCap(cap: 'butt' | 'round' | 'square') {
		if (!this.__ctx) return;

		this.__ctx.lineCap = cap;
	}

	setLineJoin(join: CanvasLineJoin) {
		if (!this.__ctx) return;

		this.__ctx.lineJoin = join;
	}

	setMiterLimit(limit: number) {
		if (!this.__ctx) return;

		this.__ctx.miterLimit = limit;
	}

	setShadowColor(color: float4) {
		if (!this.__ctx) return;

		this.__ctx.shadowColor = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
			color[3]
		})`;
	}

	setShadowBlur(blur: number) {
		if (!this.__ctx) return;

		this.__ctx.shadowBlur = blur;
	}

	setShadowOffset(offset: float2) {
		if (!this.__ctx) return;

		this.__ctx.shadowOffsetX = offset[0];
		this.__ctx.shadowOffsetY = offset[1];
	}

	setGlobalAlpha(alpha: number) {
		if (!this.__ctx) return;

		this.__ctx.globalAlpha = alpha;
	}

	setGlobalCompositeOperation(op: string) {
		if (!this.__ctx) return;

		this.__ctx.globalCompositeOperation = op as any;
	}

	setImageSmoothingEnabled(enabled: boolean) {
		if (!this.__ctx) return;

		this.__ctx.imageSmoothingEnabled = enabled;
	}

	setImageSmoothingQuality(quality: ImageSmoothingQuality) {
		if (!this.__ctx) return;

		this.__ctx.imageSmoothingQuality = quality;
	}

	setLineDash(dash: number[]) {
		if (!this.__ctx) return;

		this.__ctx.setLineDash(dash);
	}

	setLineDashOffset(offset: number) {
		if (!this.__ctx) return;

		this.__ctx.lineDashOffset = offset;
	}

	setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
		if (!this.__ctx) return;

		this.__ctx.setTransform(a, b, c, d, e, f);
	}

	resetTransform() {
		if (!this.__ctx) return;

		this.__ctx.resetTransform();
	}

	scale(v: float2) {
		if (!this.__ctx) return;

		this.__ctx.scale(v[0], v[1]);
	}

	rotate(angle: number) {
		if (!this.__ctx) return;

		this.__ctx.rotate(angle);
	}

	translate(v: float2) {
		if (!this.__ctx) return;

		this.__ctx.translate(v[0], v[1]);
	}

	private flushPoints() {
		if (!this.__ctx) return;
		if (!this.fastPoints) return;
		if (!this.fastPointsBuffer) return;

		this.__ctx.putImageData(this.fastPointsBuffer, 0, 0);

		this.fastPoints = false;
		this.fastPointsBuffer = null;

		this.pointsCounter = 0;
	}

	private pointsCounter: number = 0;
	private cacheSize: [number, number] = [0, 0];
	point(pos: float2, color?: float4) {
		if (!this.__ctx) return;

		this.pointsCounter++;

		this.__beforeDraw();
		if (this.pointsCounter > 10) {
			if (!this.fastPoints) {
				this.fastPoints = true;
				this.cacheSize = [this.__offscreen_canvas!.width, this.__offscreen_canvas!.height];
				this.fastPointsBuffer = this.__ctx.getImageData(0, 0, this.cacheSize[0], this.cacheSize[1]);
			}

			if (!this.fastPointsBuffer) return;

			let x = Math.floor(pos[0]);
			let y = Math.floor(pos[1]);

			let index = (y * this.cacheSize[0] + x) * 4;

			if (!color) {
				color = this.__currentColor;
			}
			let oldColorx = this.fastPointsBuffer.data[index] / 255;
			let oldColory = this.fastPointsBuffer.data[index + 1] / 255;
			let oldColorz = this.fastPointsBuffer.data[index + 2] / 255;
			let oldColora = this.fastPointsBuffer.data[index + 3] / 255;

			this.fastPointsBuffer.data[index] =
				color[0] * 255 * color[3] + oldColorx * 255 * (1 - color[3]);
			this.fastPointsBuffer.data[index + 1] =
				color[1] * 255 * color[3] + oldColory * 255 * (1 - color[3]);
			this.fastPointsBuffer.data[index + 2] =
				color[2] * 255 * color[3] + oldColorz * 255 * (1 - color[3]);
			this.fastPointsBuffer.data[index + 3] = color[3] * 255 + oldColora * 255 * (1 - color[3]);
		} else {
			this.__setColor(color);
			this.__ctx.fillRect(pos[0], pos[1], 1, 1);
		}
		this.__afterDraw();
	}

	vector(
		pos: float2,
		dir: float2,
		color: float4 = [0.9803921568627451, 0.8, 0.08235294117647059, 1] as float4,
		width: number = 4
	) {
		if (!this.__ctx || (dir[0] == 0 && dir[1] == 0)) return;

		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.beginPath();
		this.setStrokeWidth(width);
		this.__ctx.moveTo(pos[0], pos[1]);
		this.__ctx.lineCap = 'round';

		this.__ctx.lineTo(pos[0] + dir[0], pos[1] + dir[1]);
		this.__ctx.stroke();
		this.__ctx.beginPath();
		this.__ctx.moveTo(pos[0] + dir[0], pos[1] + dir[1]);
		// Arrows
		let arrowSize = 20;
		let arrowAngle = Math.PI / 5;
		let dirAngle = Math.atan2(dir[1], dir[0]) + Math.PI;
		let arrow1 = [
			Math.cos(dirAngle + arrowAngle) * arrowSize,
			Math.sin(dirAngle + arrowAngle) * arrowSize
		];
		let arrow2 = [
			Math.cos(dirAngle - arrowAngle) * arrowSize,
			Math.sin(dirAngle - arrowAngle) * arrowSize
		];
		this.__ctx.lineTo(pos[0] + dir[0] + arrow1[0], pos[1] + dir[1] + arrow1[1]);
		this.__ctx.moveTo(pos[0] + dir[0], pos[1] + dir[1]);
		this.__ctx.lineTo(pos[0] + dir[0] + arrow2[0], pos[1] + dir[1] + arrow2[1]);

		this.__ctx.stroke();

		this.__afterDraw();
		this.pointsCounter = 0;
	}

	grid(
		center: float2,
		count: float2,
		gap: float2,
		color: float4 = [0.1607843137254902, 0.1450980392156863, 0.1411764705882353, 1] as float4,
		width: number = 2
	) {
		if (!this.__ctx) return;

		this.__beforeDraw();

		this.__setColor(color);
		this.__ctx.beginPath();
		this.setStrokeWidth(width);

		let start = [
			center[0] - (count[0] / 2) * gap[0],
			center[1] - (count[1] / 2) * gap[1]
		] as float2;

		for (let i = 0; i <= count[0]; i++) {
			this.__ctx.moveTo(start[0] + i * gap[0], start[1]);
			this.__ctx.lineTo(start[0] + i * gap[0], start[1] + count[1] * gap[1]);
		}

		for (let i = 0; i <= count[1]; i++) {
			this.__ctx.moveTo(start[0], start[1] + i * gap[1]);
			this.__ctx.lineTo(start[0] + count[0] * gap[0], start[1] + i * gap[1]);
		}

		this.__ctx.stroke();

		this.__afterDraw();
		this.pointsCounter = 0;
	}
}

declare global {
	const paint: PaintingContext;
}
