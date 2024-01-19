import { buffer } from '/_std/buffer';
import { float4, float3, float, float2, bool, int, uint } from '/std_math';

export function drawCount(triCount: number, vertexShader: shader, pixelShader: shader) {
	__shadeup_dispatch_draw_count(triCount, vertexShader, pixelShader);
}
