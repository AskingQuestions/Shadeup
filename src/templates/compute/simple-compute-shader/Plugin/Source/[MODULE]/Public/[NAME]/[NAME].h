#pragma once

#include "CoreMinimal.h"
#include "GenericPlatform/GenericPlatformMisc.h"
#include "Kismet/BlueprintAsyncActionBase.h"
#include "${NAME}.generated.h"

struct ${SCOPE} F${NAME}DispatchParams
{
	int X;
	int Y;
	int Z;

	${instance.example == "pi" ? `
	float Seed;

	uint32 TotalInCircle;
	` : ""}${instance.example == "base" ? `
	int Input[2];
	int Output;
	` : ""}${instance.example == "rt" ? `
	FRenderTarget* RenderTarget;
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
		F${NAME}DispatchParams Params${instance.example == 'pi' || instance.example == 'base' ? `,\n\t\tTFunction<void(int OutputVal)> AsyncCallback` : ``}
	);

	// Executes this shader on the render thread from the game thread via EnqueueRenderThreadCommand
	static void DispatchGameThread(
		F${NAME}DispatchParams Params${ifExample('base', `,\n\t\tTFunction<void(int OutputVal)> AsyncCallback`)}
	)
	{
		ENQUEUE_RENDER_COMMAND(SceneDrawCompletion)(
		[Params${ifExample('base', `, AsyncCallback`)}](FRHICommandListImmediate& RHICmdList)
		{
			DispatchRenderThread(RHICmdList, Params${ifExample('base', `, AsyncCallback`)});
		});
	}

	// Dispatches this shader. Can be called from any thread
	static void Dispatch(
		F${NAME}DispatchParams Params${ifExample('base', `,\n\t\tTFunction<void(int OutputVal)> AsyncCallback`)}
	)
	{
		if (IsInRenderingThread()) {
			DispatchRenderThread(GetImmediateCommandList_ForRenderCommand(), Params${ifExample('base', `, AsyncCallback`)});
		}else{
			DispatchGameThread(Params${ifExample('base', `, AsyncCallback`)});
		}
	}
};
${instance.example == 'rt' ? `
// This is a static blueprint library that can be used to invoke our compute shader from blueprints.
UCLASS()
class ${SCOPE} U${NAME}Library : public UObject
{
	GENERATED_BODY()
	
public:
	${instance.example == "base" ? `
	UFUNCTION(BlueprintCallable)
	static int ExecuteBaseComputeShader(int Arg1, int Arg2)
	{
		// Create a dispatch parameters struct and fill it the input array with our args
		F${NAME}DispatchParams Params(1, 1, 1);
		Params.Input[0] = Arg1;
		Params.Input[1] = Arg2;

		// Dispatch the compute shader and block until it completes
		F${NAME}Interface::Dispatch(Params);

		// Params was passed by reference and we set the Output member to the result of the compute shader
		return Params.Output;
	}
	` : ""}${instance.example == "rt" ? `
	UFUNCTION(BlueprintCallable)
	static void ExecuteRTComputeShader(UTextureRenderTarget2D* RT)
	{
		// Create a dispatch parameters struct and fill it the input array with our args
		F${NAME}DispatchParams Params(RT->SizeX, RT->SizeY, 1);
		Params.RenderTarget = RT->GameThread_GetRenderTargetResource();

		F${NAME}Interface::Dispatch(Params);
	}`: ``}
};` : ``}
${instance.example == 'base' || instance.example == 'pi' ? `
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOn${NAME}Library_AsyncExecutionCompleted, const int, Value);

UCLASS() // Change the _API to match your project
class ${SCOPE} U${NAME}Library_AsyncExecution : public UBlueprintAsyncActionBase
{
	GENERATED_BODY()

public:

	/** Execute the actual load */
	virtual void Activate() override {
		// Create a dispatch parameters struct and fill it the input array with our args
		F${NAME}DispatchParams Params(1, 1, 1);
		Params.Input[0] = Arg1;
		Params.Input[1] = Arg2;

		// Dispatch the compute shader and block until it completes
		F${NAME}Interface::DispatchRDG(Params, [this](int OutputVal) {
			this->Completed.Broadcast(OutputVal);
		});
	}

	${instance.example == "pi" ? `
	UFUNCTION(BlueprintCallable)
	static double CalculatePIComputeShader(int TotalSamples, float Seed)
	{
		// Create a dispatch parameters struct and give it a seed
		F${NAME}DispatchParams Params(TotalSamples, 1, 1);
		Params.Seed = Seed;
		F${NAME}Interface::Dispatch(Params);

		// Params.TotalInCircle is set to the result of the compute shader
		// Divide by the total number of samples to get the ratio of samples in the circle
		// We're multiplying by 4 because the simulation is done in quarter-circles
		double pi = 4.0 * ((double) Params.TotalInCircle / (double) TotalSamples);

		return pi;
	}
	` : ""}
	${instance.example == "base" ? `
	UFUNCTION(BlueprintCallable, meta = (BlueprintInternalUseOnly = "true", Category = "ComputeShader", WorldContext = "WorldContextObject"))
	static U${NAME}Library_AsyncExecution* ExecuteBaseComputeShader(UObject* WorldContextObject, int Arg1, int Arg2) {
		U${NAME}Library_AsyncExecution* Action = NewObject<U${NAME}Library_AsyncExecution>();
		Action->Arg1 = Arg1;
		Action->Arg2 = Arg2;
		Action->RegisterWithGameInstance(WorldContextObject);

		return Action;
	}` : ``}

	UPROPERTY(BlueprintAssignable)
	FOn${NAME}Library_AsyncExecutionCompleted Completed;

	int Arg1;
	int Arg2;
};` : ``}