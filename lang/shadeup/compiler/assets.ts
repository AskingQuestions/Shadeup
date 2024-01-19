import type { AssetFileType } from '../../components/common/Asset';

import builtInAssets from './assets.json';

export function buildAssetsFile(content: string) {
	let out = `
import {
float4,
float3,
float,
float2,
bool,
int,
int2,
int3,
int4,
uint,
uint2,
uint3,
uint4,
uint8
} from '/std_math';

import { Mesh, Model } from '/_std/mesh';
import { texture2d } from '/_std/texture';

declare global {\n`;
	let typeMapping: { [key in AssetFileType]: string } = {
		image: 'texture2d<float4>',
		audio: 'unknown',
		video: 'unknown',
		binary: 'buffer<uint8>',
		text: 'string',
		model: 'Model'
	};

	try {
		let parsed = JSON.parse(content);

		parsed.forEach((asset: { name: string; type: AssetFileType; previewId: string }) => {
			let docCom = `![thumb](https://assets.shadeup.dev/`;
			out += `
/**
 * ${docCom}${asset.previewId})
 */
function load(asset: '${asset.name}'): ${typeMapping[asset.type]};
`;
		});
	} catch (e) {
		console.error(e);
	}

	for (let asset of builtInAssets) {
		out += `
/**
* Built-in asset: ${asset[0]}
*/
function load(asset: '${asset[0]}'): ${typeMapping[asset[1] as AssetFileType]};
`;
	}

	return out + `}`;
}

export const defaultAssets = builtInAssets;
