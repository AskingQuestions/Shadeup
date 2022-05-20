#pragma once


#include "CoreMinimal.h"
#include "${MODULE_NAME}/Public/${MODULE_NAME}.h"

#include "MeshPassProcessor.h"
#include "RHICommandList.h"
#include "RenderGraphBuilder.h"
#include "RenderTargetPool.h"
#include "MeshMaterialShader.h"
#include "ShaderParameterUtils.h"
#include "RHIStaticStates.h"
#include "Shader.h"
#include "RHI.h"
#include "GlobalShader.h"
#include "RenderGraphUtils.h"
#include "ShaderParameterStruct.h"
#include "UniformBuffer.h"
#include "RHICommandList.h"
#include "ShaderCompilerCore.h"
#include "Renderer/Private/ScenePrivate.h"
#include "EngineDefines.h"
#include "RendererInterface.h"
#include "RenderResource.h"
#include "RenderGraphResources.h"

#include "RenderGraphResources.h"
#include "Runtime/Engine/Classes/Engine/TextureRenderTarget2D.h"

#define NUM_THREADS_${CLASS_NAME}_X ${instance.threadCounts[0]}
#define NUM_THREADS_${CLASS_NAME}_Y ${instance.threadCounts[1]}
#define NUM_THREADS_${CLASS_NAME}_Z ${instance.threadCounts[2]}

class ${SCOPE} F${CLASS_NAME}Context {
public:
	F${CLASS_NAME}Context() {
		
	}

	struct LocalDrawParameters {
		${
			instance.parameters.map(p => `${p.realCppType} ${p.name};`).join('\n\t\t')
		}
	};

	LocalDrawParameters DrawParameters;

	${
	instance.parameters.map(p => `void Set${p.name}(${p.realCppType} _${p.name}) {
		this->DrawParameters.${p.name} = _${p.name};
	}`).join('\n\n\t')
	}

	// Executes this shader on the render thread
	void DispatchRenderThread(FRHICommandListImmediate& RHICmdList, LocalDrawParameters Params, int x, int y, int z);

	// Executes this shader on the render thread from the game thread via EnqueueRenderThreadCommand
	void DispatchGameThread(int x, int y, int z) {
		LocalDrawParameters params = this->DrawParameters;
		ENQUEUE_RENDER_COMMAND(SceneDrawCompletion)(
		[this, params, x, y, z](FRHICommandListImmediate& RHICmdList)
		{
			this->DispatchRenderThread(RHICmdList, params, x, y, z);
		});
	}

	// Dispatches this shader. Can be called from any thread
	void Dispatch(int x, int y, int z) {
		if (IsInRenderingThread()) {
			DispatchRenderThread(GetImmediateCommandList_ForRenderCommand(), this->DrawParameters, x, y, z);
		}else{
			DispatchGameThread(x, y, z);
		}
	}
};

typedef TSharedPtr<F${CLASS_NAME}Context, ESPMode::ThreadSafe> F${CLASS_NAME}ContextPtr;

/**************************************************************************************/
/* This is just an interface we use to keep all the compute shading code in one file. */
/**************************************************************************************/
class ${SCOPE} ${CLASS_NAME}
{
public:
	static F${CLASS_NAME}ContextPtr Prepare() {
		F${CLASS_NAME}ContextPtr context = MakeShareable(new F${CLASS_NAME}Context());
		return context;
	}
};
