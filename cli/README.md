<p align="center"><a href="https://shadeup.dev" target="_blank" rel="noopener noreferrer"><img width="200" src="https://shadeup.dev/favicon.png" alt="Shadeup logo"></a></p>

<h1 align="center"><a href="https://shadeup.dev">Shadeup CLI</a></h1>

# Shadeup compiler tools

## Installation

```sh
npm install -g @shadeup/cli
```

## Usage

```sh
shadeup --help
```

```sh
CLI tool for compiling shadeup files

Options:
  -V, --version           output the version number
  -v
  -h, --help              display help for command

Commands:
  build [options] <file>  Build file
  watch <file>            Watch a shadeup file and recompile on change
  preview <file>          Live preview of a shadeup file in electron
```

## Example

```ts
// main.shadeup
fn main() {
  draw(shader {
    out.color = (in.uv, 0.5, 1.0);
  });
}
```

```sh
$ shadeup build main.shadeup
```

After running the above command, you should find the following files in the same directory as `main.shadeup`:

- `main.js`
- `main.d.ts`

You can use the above files inside of a vite or webpack project to use the shader in your web application.

```sh
$ npm i shadeup
```

```js
// example.ts
import { makeShadeupInstance } from "./main";

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;

(async () => {
  const engine = await makeShadeupInstance(canvas);

  // Optionally enable the UI
  await engine.enableUI();

  // The frame loop will start automatically

  // You can call pub functions on the engine instance
  // engine.files.main.exampleFunction();
})();
```

## Preview mode

```sh
$ shadeup preview main.shadeup
```

This will open an electron window with the shader preview. You can use this to quickly test your shader without having to set up a web project.

![Preview](https://i.imgur.com/PVjn7BA.png)
