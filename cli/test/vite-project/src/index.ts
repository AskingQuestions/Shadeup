import { makeShadeupInstance } from "./main";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
(async () => {
  let engine = await makeShadeupInstance(canvas);
  await engine.enableUI();
  console.log(engine);
  let tex = await engine.loadTexture2dFromURL(
    "https://i.imgur.com/XxtTu4t.jpeg"
  );
  engine.files.main.setTexture(tex);

  let model = await engine.loadModelFromURL(
    "https://s3-eu-west-1.amazonaws.com/fetchcfd/original/file-1571050371399.glb"
  );
  // console.log(model);
  // engine.files.main.setModel(model);
  // engine.files.main.setSpawning(true);
  // engine.files.main.useTex(await engine);
})();

function sizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}

sizeCanvas();

window.addEventListener("resize", sizeCanvas);
