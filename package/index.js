import {
  linkIntoEngine,
  makeShadeupEngine,
} from "./engine-dist/shadeup-engine";
import { linkShadeupLibrary } from "./library";

export const bindShadeupEngine = (fn) => {
  return async (canvas) => {
    const engine = await import("./engine");
    const localEngineContext = await makeShadeupEngine(canvas);
    linkIntoEngine(localEngineContext, (def) => {
      linkShadeupLibrary(def, localEngineContext);
      fn(def, localEngineContext);
    });
    return localEngineContext;
  };
};
