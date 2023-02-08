#pragma once

#include "CoreMinimal.h"
#include "GenericPlatform/GenericPlatformMisc.h"
#include "Kismet/BlueprintAsyncActionBase.h"
#include "Engine/TextureRenderTarget2D.h"
${instance.material ? `#include "Renderer/Private/ScenePrivate.h"\n` : ``}
#include "${NAME}.generated.h"

struct ${SCOPE} F${NAME}DispatchParams
{
	int X;
	int Y;
	int Z;

	${instance.example == "pi" ? `
	float Seed;
	` : ""}${instance.example == "base" ? `
	int Input[2];
	int Output;
	` : ""}${instance.example == "rt" ? `
	FRenderTarget* RenderTarget;
	` : ""}${instance.example == "mat" ? `
	FRenderTarget* RenderTarget;
	` : ""}${instance.example == "basemat" ? `
	FVector2f Position;
	` : ""}
	${instance.material ? `// Set to the desired material uses when executing our compute shader\n\tFMaterialRenderProxy* MaterialRenderProxy;\n\t// Scene reference used to create a uniform buffer for rendering the material graph\n\tFScene* Scene;\n\tfloat GameTime;\n\tuint32 Random;` : ``}

	F${NAME}DispatchParams(int x, int y, int z)
		: X(x)
		, Y(y)
		, Z(z)
	{
	}
};

// This is a public interface that we define so outside code can invoke our compute shader.
class ${SCOPE} F${NAME}Interface {
public:
	// Executes this shader on the render thread
	static void DispatchRenderThread(
		FRHICommandListImmediate& RHICmdList,
		F${NAME}DispatchParams Params${ifExample('base', `,\n\t\tTFunction<void(int OutputVal)> AsyncCallback`)}${ifExample('basemat', `,\n\t\tTFunction<void(FVector3f OutputColor)> AsyncCallback`)}${ifExample('pi', `,\n\t\tTFunction<void(int TotalInCircle)> AsyncCallback`)}
	);

	// Executes this shader on the render thread from the game thread via EnqueueRenderThreadCommand
	static void DispatchGameThread(
		F${NAME}DispatchParams Params${ifExample(['pi', 'base'], `,\n\t\tTFunction<void(int OutputVal)> AsyncCallback`)}${ifExample('basemat', `,\n\t\tTFunction<void(FVector3f OutputVal)> AsyncCallback`)}
	)
	{
		ENQUEUE_RENDER_COMMAND(SceneDrawCompletion)(
		[Params${ifExample(['pi', 'base', 'basemat'], `, AsyncCallback`)}](FRHICommandListImmediate& RHICmdList)
		{
			DispatchRenderThread(RHICmdList, Params${ifExample(['pi', 'base', 'basemat'], `, AsyncCallback`)});
		});
	}

	// Dispatches this shader. Can be called from any thread
	static void Dispatch(
		F${NAME}DispatchParams Params${ifExample('base', `,\n\t\tTFunction<void(int OutputVal)> AsyncCallback`)}${ifExample('basemat', `,\n\t\tTFunction<void(FVector3f OutputColor)> AsyncCallback`)}${ifExample('pi', `,\n\t\tTFunction<void(int TotalInCircle)> AsyncCallback`)}
	)
	{
		if (IsInRenderingThread()) {
			DispatchRenderThread(GetImmediateCommandList_ForRenderCommand(), Params${ifExample(['pi', 'base', 'basemat'], `, AsyncCallback`)});
		}else{
			DispatchGameThread(Params${ifExample(['pi', 'base', 'basemat'], `, AsyncCallback`)});
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
	UFUNCTION(BlueprintCallable)
	static void ExecuteRTComputeShader(UTextureRenderTarget2D* RT)
	{
		// Create a dispatch parameters struct and fill it the input array with our args
		F${NAME}DispatchParams Params(RT->SizeX, RT->SizeY, 1);
		Params.RenderTarget = RT->GameThread_GetRenderTargetResource();

		F${NAME}Interface::Dispatch(Params);
	}
};` : ``}${instance.example == 'mat' ? `
// This is a static blueprint library that can be used to invoke our compute shader from blueprints.
UCLASS()
class ${SCOPE} U${NAME}Library : public UObject
{
	GENERATED_BODY()
	
public:
	UFUNCTION(BlueprintCallable)
	static void ExecuteMaterialRTComputeShader(AActor* SceneContext, UMaterialInterface* Material, UTextureRenderTarget2D* RT)
	{
		// Create a dispatch parameters struct and fill it the input array with our args
		F${NAME}DispatchParams Params(RT->SizeX, RT->SizeY, 1);
		Params.RenderTarget = RT->GameThread_GetRenderTargetResource();
		Params.MaterialRenderProxy = Material->GetRenderProxy();
		Params.Scene = SceneContext->GetRootComponent()->GetScene()->GetRenderScene();
		Params.Random = FMath::Rand();
		Params.GameTime = SceneContext->GetWorld()->GetTimeSeconds();

		F${NAME}Interface::Dispatch(Params);
	}
};` : ``}
${instance.example == 'base' || instance.example == 'pi' || instance.example == 'basemat' ? `
${instance.example == 'base' ? `
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOn${NAME}Library_AsyncExecutionCompleted, const int, Value);
` : ``}${instance.example == 'pi' ? `
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOn${NAME}Library_AsyncExecutionCompleted, const double, Value);
` : ``}${instance.example == 'basemat' ? `
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOn${NAME}Library_AsyncExecutionCompleted, const FVector3f, Value);
` : ``}

UCLASS() // Change the _API to match your project
class ${SCOPE} U${NAME}Library_AsyncExecution : public UBlueprintAsyncActionBase
{
	GENERATED_BODY()

public:
	${instance.example == "base" ? `
	// Execute the actual load
	virtual void Activate() override {
		// Create a dispatch parameters struct and fill it the input array with our args
		F${NAME}DispatchParams Params(1, 1, 1);
		Params.Input[0] = Arg1;
		Params.Input[1] = Arg2;

		// Dispatch the compute shader and wait until it completes
		F${NAME}Interface::Dispatch(Params, [this](int OutputVal) {
			this->Completed.Broadcast(OutputVal);
		});
	}
	` : ""}${instance.example == "basemat" ? `
	// Execute the actual load
	virtual void Activate() override {
		// Create a dispatch parameters struct and set the position passed into our material call
		F${NAME}DispatchParams Params(1, 1, 1);
		Params.Position = Position;
		Params.MaterialRenderProxy = MaterialRenderProxy;
		Params.Scene = Scene;
		Params.Random = Random;
		Params.GameTime = GameTime;

		// Dispatch the compute shader and wait until it completes
		F${NAME}Interface::Dispatch(Params, [this](FVector3f OutputColor) {
			this->Completed.Broadcast(OutputColor);
		});
	}`: ``}${instance.example == "pi" ? `
	// Execute the actual load
	virtual void Activate() override {
		// Create a dispatch parameters struct and set our desired seed
		F${NAME}DispatchParams Params(TotalSamples, 1, 1);
		Params.Seed = Seed;

		// Dispatch the compute shader and wait until it completes
		F${NAME}Interface::Dispatch(Params, [this](int TotalInCircle) {
			// TotalInCircle is set to the result of the compute shader
			// Divide by the total number of samples to get the ratio of samples in the circle
			// We're multiplying by 4 because the simulation is done in quarter-circles
			double FinalPI = ((double) TotalInCircle / (double) TotalSamples);

			Completed.Broadcast(FinalPI);
		});
	}`: ``}
	${instance.example == "pi" ? `
	UFUNCTION(BlueprintCallable, meta = (BlueprintInternalUseOnly = "true", Category = "ComputeShader", WorldContext = "WorldContextObject"))
	static U${NAME}Library_AsyncExecution* ExecutePIComputeShader(UObject* WorldContextObject, int TotalSamples, float Seed) {
		U${NAME}Library_AsyncExecution* Action = NewObject<U${NAME}Library_AsyncExecution>();
		Action->TotalSamples = TotalSamples;
		Action->Seed = Seed;
		Action->RegisterWithGameInstance(WorldContextObject);

		return Action;
	}` : ``}
	${instance.example == "base" ? `
	UFUNCTION(BlueprintCallable, meta = (BlueprintInternalUseOnly = "true", Category = "ComputeShader", WorldContext = "WorldContextObject"))
	static U${NAME}Library_AsyncExecution* ExecuteBaseComputeShader(UObject* WorldContextObject, int Arg1, int Arg2) {
		U${NAME}Library_AsyncExecution* Action = NewObject<U${NAME}Library_AsyncExecution>();
		Action->Arg1 = Arg1;
		Action->Arg2 = Arg2;
		Action->RegisterWithGameInstance(WorldContextObject);

		return Action;
	}` : ``}${instance.example == "basemat" ? `
	UFUNCTION(BlueprintCallable, meta = (BlueprintInternalUseOnly = "true", Category = "ComputeShader", WorldContext = "WorldContextObject"))
	static U${NAME}Library_AsyncExecution* ExecuteBaseMaterialComputeShader(UObject* WorldContextObject, AActor* SceneContext, UMaterialInterface* Material, FVector2D Position) {
		check(IsValid(SceneContext));
		U${NAME}Library_AsyncExecution* Action = NewObject<U${NAME}Library_AsyncExecution>();
		Action->Position = static_cast<FVector2f>(Position);
		Action->MaterialRenderProxy = Material->GetRenderProxy();
		Action->Scene = SceneContext->GetRootComponent()->GetScene()->GetRenderScene();
		Action->Random = FMath::Rand();
		Action->GameTime = SceneContext->GetWorld()->GetTimeSeconds();
		Action->RegisterWithGameInstance(WorldContextObject);

		return Action;
	}` : ``}

	UPROPERTY(BlueprintAssignable)
	FOn${NAME}Library_AsyncExecutionCompleted Completed;

	${instance.example == "pi" ? `
	float Seed;
	int TotalSamples;
	` : ``}${instance.example == "base" ? `
	int Arg1;
	int Arg2;
	` : ``}${instance.example == "basemat" ? `
	FVector2f Position;
	FMaterialRenderProxy* MaterialRenderProxy;
	float GameTime;
	uint32 Random;
	FScene* Scene;
	` : ``}
};` : ``}