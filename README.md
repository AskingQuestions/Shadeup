<center>

![Logo](/resources/img/logo.png)

<h1>Shadeup</h1>

</center>

Shadeup is a CLI tool for scaffolding various Unreal Engine shader patterns.

# Installation & Usage

```sh
$ npm install shadeup
```

```sh
$ cd MyUnrealProject
$ shadeup # This will start the scaffolding wizard
```

# Currently available generators & examples:

## **Indirect Instancing**
* **Base** (single triangle)
* **View dependent subdividing grid** (triangle grid that increases in resolution)
* **Mesh instancing** (ISM component but GPU-driven)
* **Multi-frame instance state** (growing orbs)

## **Custom Material Nodes**

* **Base Function** (Input -> Output setup with HLSL)
* **Base Final Output** (Custom node that accepts inputs and allows you to evaluate the graph in other contexts (compute, vertex, pixel))
* **Base Input Only** (Input only setup)
* **Dynamic Inputs** (Variable number of input pins)

## **SceneProxy/VertexFactory** 
* **Base** (Pass through StaticMeshComponent with custom pixel/vertex shader)
* **Dynamic Vertex Stream** (CPU-driven vertex data)

## **Compute Shader**
* **Base** (Executable compute shader with inputs and outputs)
* **PI** (Calculate PI using random sampling (monte carlo))
* **Render Target** (Draw into a render target using a compute shader)
* **Material Evaluation** (Execute a material graph from within a compute shader)