import { makeShadeupInstance } from "./main";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
(async () => {
  let engine = await makeShadeupInstance(canvas);
  console.log(engine);
})();

function sizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}

sizeCanvas();

window.addEventListener("resize", sizeCanvas);
