import * as __ from "shadeup/math";

declare namespace ShadeupFiles {
  declare namespace sand {
    export declare function pcg_hash(input: __.uint): __.uint;
    export declare function main(): void;
  }
  declare namespace camera {
    declare class CustomCamera2d {
        constructor(data: {
            position?: __.float2;
            zoom?: __.float;
        });
        screenToCamera(screen: __.float2): __.float2;
        cameraToScreen(camera: __.float2): __.float2;
        transform(position: __.float2): __.float2;
        zoomBy(zoom: __.float, center: __.float2): void;
        position: __.float2;
        zoom: __.float;
        clone(): CustomCamera2d;
    }
    export declare function getCamera2d(): CustomCamera2d;
    export {};
  }
}

export declare function makeShadeupInstance(
  canvas: HTMLCanvasElement,
  options?: {
    preferredAdapter?: "webgl" | "webgpu";
    limits?: GPUSupportedLimits;
    ui?: boolean;
  }
): Promise<{
  /**
   * Set to false to pause
   */
  playing: boolean;

  canvas: HTMLCanvasElement;

  adapter: any;
  hooks: {
    beforeFrame?: () => void;
    afterFrame?: () => void;
    reset?: () => void;
  }[];
  start: () => void;

  env: {
    camera: {
      position: __.float3;
      rotation: __.float4;
      width: __.float;
      height: __.float;
      fov: __.float;
      near: __.float;
      far: __.float;
    };
    camera2d: {
      position: __.float2;
      zoom: __.float;
    };
    deltaTime: __.float;
    frame: __.int;
    keyboard: any;
    mouse: any;
    screenSize: __.float2;
    time: __.float;
  };

  /**
   * Used to pass values into the shadeup env (accessed as env.input("name") inside)
   */
  inputValues: Map<string, any>;

  enableUI: () => Promise<void>;

  loadTextureFromImageLike: (
		img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas | HTMLVideoElement
	) => Promise<__.texture2d<__.float4>>;
	loadTexture2dFromURL: (url: string) => Promise<__.texture2d<__.float4>>;
	loadModelFromURL: (urlGltf: string) => Promise<__.texture2d<__.float4>>;

  files: typeof ShadeupFiles;
}>;
