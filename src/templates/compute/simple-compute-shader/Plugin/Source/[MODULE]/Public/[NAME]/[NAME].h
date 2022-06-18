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

	static void DispatchRDGRenderThread(
		FRHICommandListImmediate& RHICmdList,
		F${NAME}DispatchParams Params,
		TFunction<void(int OutputVal)> AsyncCallback
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

	// Executes this shader on the render thread from the game thread via EnqueueRenderThreadCommand
	static void DispatchRDGGameThread(
		F${NAME}DispatchParams Params,
		TFunction<void(int OutputVal)> AsyncCallback
	)
	{
		ENQUEUE_RENDER_COMMAND(SceneDrawCompletion)(
		[Params, AsyncCallback](FRHICommandListImmediate& RHICmdList)
		{
			DispatchRDGRenderThread(RHICmdList, Params, AsyncCallback);
		});
	}

	// Dispatches this shader. Can be called from any thread
	static void DispatchRDG(
		F${NAME}DispatchParams Params,
		TFunction<void(int OutputVal)> AsyncCallback
	)
	{
		if (IsInRenderingThread()) {
			DispatchRDGRenderThread(GetImmediateCommandList_ForRenderCommand(), Params, AsyncCallback);
		}else{
			DispatchRDGGameThread(Params, AsyncCallback);
		}
	}
};

// This is a static blueprint library that can be used to invoke our compute shader from blueprints.
UCLASS()
class ${SCOPE} U${NAME}Library : public UObject
{
	GENERATED_BODY()
	
public:
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
	` : ""}${instance.example == "base" ? `
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
	` : ""}
};

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

	UFUNCTION(BlueprintCallable, meta = (BlueprintInternalUseOnly = "true", Category = "ComputeShader", WorldContext = "WorldContextObject"))
	static U${NAME}Library_AsyncExecution* ExecuteBaseComputeShader(UObject* WorldContextObject, int Arg1, int Arg2) {
		U${NAME}Library_AsyncExecution* Action = NewObject<U${NAME}Library_AsyncExecution>();
		Action->Arg1 = Arg1;
		Action->Arg2 = Arg2;
		Action->RegisterWithGameInstance(WorldContextObject);

		return Action;
	}

	UPROPERTY(BlueprintAssignable)
	FOn${NAME}Library_AsyncExecutionCompleted Completed;

	int Arg1;
	int Arg2;
};