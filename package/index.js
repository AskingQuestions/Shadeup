import {
  linkIntoEngine,
  makeShadeupEngine,
} from "./engine-dist/shadeup-engine.js";
import { linkShadeupLibrary } from "./library.js";

export const bindShadeupEngine = (fn) => {
  return async (canvas, options) => {
    const engine = await import("./engine");
    const localEngineContext = await makeShadeupEngine(canvas, options);
    if (options && options.ui) {
      await localEngineContext.enableUI();
    }
    await linkIntoEngine(localEngineContext, (def) => {
      linkShadeupLibrary(def, localEngineContext);
      fn(def, localEngineContext);
    });
    return localEngineContext;
  };
};
