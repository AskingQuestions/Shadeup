import * as __ from "shadeup/math";

declare namespace ShadeupFiles {
  declare namespace __lib {
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
