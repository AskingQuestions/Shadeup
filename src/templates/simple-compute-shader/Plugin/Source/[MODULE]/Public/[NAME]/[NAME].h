#pragma once

#include "CoreMinimal.h"
#include "${NAME}.generated.h"

struct ${SCOPE} F${NAME}DispatchParams
{
	int X;
	int Y;
	int Z;

	${instance.example == "pi" ? `
	float Seed;

	uint32 TotalInCircle;
	` : ""}

	F${NAME}DispatchParams(int x, int y, int z)
		: X(x)
		, Y(y)
		, Z(z)
	{
	}
};


/*
* This is a public interface that we define so outside code can invoke our compute shader.
*/
class ${SCOPE} F${NAME}Interface {
public:
	// Executes this shader on the render thread
	static void DispatchRenderThread(
		FRHICommandListImmediate& RHICmdList,
		F${NAME}DispatchParams& Params
	);

	// Executes this shader on the render thread from the game thread via EnqueueRenderThreadCommand
	static void DispatchGameThread(
		F${NAME}DispatchParams& Params
	)
	{
		ENQUEUE_RENDER_COMMAND(SceneDrawCompletion)(
		[&Params](FRHICommandListImmediate& RHICmdList)
		{
			DispatchRenderThread(RHICmdList, Params);
		});

		FlushRenderingCommands();
	}

	// Dispatches this shader. Can be called from any thread
	static void Dispatch(
		F${NAME}DispatchParams& Params
	)
	{
		if (IsInRenderingThread()) {
			DispatchRenderThread(GetImmediateCommandList_ForRenderCommand(), Params);
		}else{
			DispatchGameThread(Params);
		}
	}
};


UCLASS()
class ${SCOPE} U${NAME}Library : public UObject
{
	GENERATED_BODY()
	
public:
	UFUNCTION(BlueprintCallable)
	static double CalculatePIComputeShader(int TotalSamples, float Seed)
	{
		F${NAME}DispatchParams Params(TotalSamples, 1, 1);
		Params.Seed = Seed;
		F${NAME}Interface::Dispatch(Params);

		double pi = 4.0 * ((double) Params.TotalInCircle / (double) TotalSamples);

		return pi;
	}
};
