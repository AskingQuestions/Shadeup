import std from './std.ts?raw';
import ui from './ui.ts?raw';
import native from './native.ts?raw';
import buffer from './buffer.ts?raw';
import texture from './texture.ts?raw';
import physics from './physics.ts?raw';
import drawIndexed from './drawIndexed.ts?raw';
import drawCount from './drawCount.ts?raw';
import drawAttributes from './drawAttributes.ts?raw';
import paint from './paint.ts?raw';
import mesh from './mesh.shadeup?raw';
import geo from './geo.shadeup?raw';
import textures from './textures.shadeup?raw';
import common from './common.shadeup?raw';
import sdf from './sdf.shadeup?raw';

export default {
	shadeup: {
		mesh,
		textures,
		common,
		sdf,
		geo
	},
	ts: {
		std,
		ui,
		native,
		paint,
		buffer,
		texture,
		drawIndexed,
		drawAttributes,
		drawCount,
		physics
	}
};
