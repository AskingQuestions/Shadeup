import { buffer } from '/_std/buffer';
import { float4, float3, float, float2, bool, int, uint } from '/std_math';

export function drawAttributes<T extends { [key: string]: any }, X, Y>(
	indexBuffer: buffer<uint>,
	buffers:
		| Map<keyof T, buffer<any>>
		| {
				[key in keyof T]: buffer<T[key]>;
		  },
	vertexShader: shader<T, X>,
	pixelShader: shader<X, Y>
) {
	__shadeup_dispatch_draw_attributes(indexBuffer, buffer, vertexShader, pixelShader);
}
