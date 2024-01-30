import { makeShadeupInstance } from "./main";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
(async () => {
  let engine = await makeShadeupInstance(canvas);
  console.log(engine);
})();

function sizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

sizeCanvas();

window.addEventListener("resize", sizeCanvas);
