import "./style.css";
import { makeShadeupInstance } from "./runner";

const canvas = document.querySelector("#canvas");
(async () => {
  let engine = await makeShadeupInstance(canvas);
  await engine.enableUI();
})();

function sizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}

sizeCanvas();

window.addEventListener("resize", sizeCanvas);
