// Copyright Epic Games, Inc. All Rights Reserved.
// Adapted from the VirtualHeightfieldMesh plugin

#include "${NAME}SceneProxy.h"

#include "CommonRenderResources.h"
#include "EngineModule.h"
#include "Engine/Engine.h"
#include "GlobalShader.h"
#include "HAL/IConsoleManager.h"
#include "Materials/Material.h"
#include "RenderGraphBuilder.h"
#include "RenderGraphUtils.h"
#include "RenderUtils.h"
#include "${MODULE_NAME}/Public/${NAME}/${NAME}Component.h"
#include "${NAME}VertexFactory.h"

namespace ${NAME}Mesh
{
	/** Initialize the FDrawInstanceBuffers objects. */
	void InitializeInstanceBuffers(FRHICommandListImmediate& InRHICmdList, FDrawInstanceBuffers& InBuffers);

	/** Release the FDrawInstanceBuffers objects. */
	void ReleaseInstanceBuffers(FDrawInstanceBuffers& InBuffers)
	{
		InBuffers.InstanceBuffer.SafeRelease();
		InBuffers.InstanceBufferUAV.SafeRelease();
		InBuffers.InstanceBufferSRV.SafeRelease();
		InBuffers.IndirectArgsBuffer.SafeRelease();
		InBuffers.IndirectArgsBufferUAV.SafeRelease();
	}
}

/** Renderer extension to manage the buffer pool and add hooks for GPU culling passes. */
class F${NAME}RendererExtension : public FRenderResource
{
public:
	F${NAME}RendererExtension()
		: bInFrame(false)
		, DiscardId(0)
	{}

	virtual ~F${NAME}RendererExtension()
	{}

	bool IsInFrame() { return bInFrame; }

	/** Call once to register this extension. */
	void RegisterExtension();

	/** Call once per frame for each mesh/view that has relevance. This allocates the buffers to use for the frame and adds the work to fill the buffers to the queue. */
	${NAME}Mesh::FDrawInstanceBuffers& AddWork(F${NAME}SceneProxy const* InProxy, FSceneView const* InMainView, FSceneView const* InCullView);
	/** Submit all the work added by AddWork(). The work fills all of the buffers ready for use by the referencing mesh batches. */
	void SubmitWork(FRDGBuilder& GraphBuilder);

protected:
	//~ Begin FRenderResource Interface
	virtual void ReleaseRHI() override;
	//~ End FRenderResource Interface

private:
	/** Called by renderer at start of render frame. */
	void BeginFrame(FRDGBuilder& GraphBuilder);
	/** Called by renderer at end of render frame. */
	void EndFrame(FRDGBuilder& GraphBuilder);
	void EndFrame();

	/** Flag for frame validation. */
	bool bInFrame;

	/** Buffers to fill. Resources can persist between frames to reduce allocation cost, but contents don't persist. */
	TArray<${NAME}Mesh::FDrawInstanceBuffers> Buffers;
	/** Per buffer frame time stamp of last usage. */
	TArray<uint32> DiscardIds;
	/** Current frame time stamp. */
	uint32 DiscardId;

	/** Arrary of unique scene proxies to render this frame. */
	TArray<F${NAME}SceneProxy const*> SceneProxies;
	/** Arrary of unique main views to render this frame. */
	TArray<FSceneView const*> MainViews;
	/** Arrary of unique culling views to render this frame. */
	TArray<FSceneView const*> CullViews;

	/** Key for each buffer we need to generate. */
	struct FWorkDesc
	{
		int32 ProxyIndex;
		int32 MainViewIndex;
		int32 CullViewIndex;
		int32 BufferIndex;
	};

	/** Keys specifying what to render. */
	TArray<FWorkDesc> WorkDescs;

	/** Sort predicate for FWorkDesc. When rendering we want to batch work by proxy, then by main view. */
	struct FWorkDescSort
	{
		uint32 SortKey(FWorkDesc const& WorkDesc) const
		{
			return (WorkDesc.ProxyIndex << 24) | (WorkDesc.MainViewIndex << 16) | (WorkDesc.CullViewIndex << 8) | WorkDesc.BufferIndex;
		}

		bool operator()(FWorkDesc const& A, FWorkDesc const& B) const
		{
			return SortKey(A) < SortKey(B);
		}
	};
};

/** Single global instance of the VirtualHeightfieldMesh renderer extension. */
TGlobalResource< F${NAME}RendererExtension > G${NAME}RendererExtension;

void F${NAME}RendererExtension::RegisterExtension()
{
	static bool bInit = false;
	if (!bInit)
	{
		GEngine->GetPreRenderDelegateEx().AddRaw(this, &F${NAME}RendererExtension::BeginFrame);
		GEngine->GetPostRenderDelegateEx().AddRaw(this, &F${NAME}RendererExtension::EndFrame);
		bInit = true;
	}
}

void F${NAME}RendererExtension::ReleaseRHI()
{
	Buffers.Empty();
}

${NAME}Mesh::FDrawInstanceBuffers& F${NAME}RendererExtension::AddWork(F${NAME}SceneProxy const* InProxy, FSceneView const* InMainView, FSceneView const* InCullView)
{
	// If we hit this then BeginFrame()/EndFrame() logic needs fixing in the Scene Renderer.
	if (!ensure(!bInFrame))
	{
		EndFrame();
	}

	// Create workload
	FWorkDesc WorkDesc;
	WorkDesc.ProxyIndex = SceneProxies.AddUnique(InProxy);
	WorkDesc.MainViewIndex = MainViews.AddUnique(InMainView);
	WorkDesc.CullViewIndex = CullViews.AddUnique(InCullView);
	WorkDesc.BufferIndex = -1;

	// Check for an existing duplicate
	for (FWorkDesc& It : WorkDescs)
	{
		if (It.ProxyIndex == WorkDesc.ProxyIndex && It.MainViewIndex == WorkDesc.MainViewIndex && It.CullViewIndex == WorkDesc.CullViewIndex && It.BufferIndex != -1)
		{
			WorkDesc.BufferIndex = It.BufferIndex;
			break;
		}
	}

	// Try to recycle a buffer
	if (WorkDesc.BufferIndex == -1)
	{
		for (int32 BufferIndex = 0; BufferIndex < Buffers.Num(); BufferIndex++)
		{
			if (DiscardIds[BufferIndex] < DiscardId)
			{
				DiscardIds[BufferIndex] = DiscardId;
				WorkDesc.BufferIndex = BufferIndex;
				WorkDescs.Add(WorkDesc);
				break;
			}
		}
	}

	// Allocate new buffer if necessary
	if (WorkDesc.BufferIndex == -1)
	{
		DiscardIds.Add(DiscardId);
		WorkDesc.BufferIndex = Buffers.AddDefaulted();
		WorkDescs.Add(WorkDesc);
		${NAME}Mesh::InitializeInstanceBuffers(GetImmediateCommandList_ForRenderCommand(), Buffers[WorkDesc.BufferIndex]);
	}

	return Buffers[WorkDesc.BufferIndex];
}

void F${NAME}RendererExtension::BeginFrame(FRDGBuilder& GraphBuilder)
{
	// If we hit this then BeginFrame()/EndFrame() logic needs fixing in the Scene Renderer.
	if (!ensure(!bInFrame))
	{
		EndFrame();
	}
	bInFrame = true;

	if (WorkDescs.Num() > 0)
	{
		SubmitWork(GraphBuilder);
	}
}

void F${NAME}RendererExtension::EndFrame()
{
	ensure(bInFrame);
	bInFrame = false;

	SceneProxies.Reset();
	MainViews.Reset();
	CullViews.Reset();
	WorkDescs.Reset();

	// Clean the buffer pool
	DiscardId++;

	for (int32 Index = 0; Index < DiscardIds.Num();)
	{
		if (DiscardId - DiscardIds[Index] > 4u)
		{
			${NAME}Mesh::ReleaseInstanceBuffers(Buffers[Index]);
			Buffers.RemoveAtSwap(Index);
			DiscardIds.RemoveAtSwap(Index);
		}
		else
		{
			++Index;
		}
	}
}

void F${NAME}RendererExtension::EndFrame(FRDGBuilder& GraphBuilder)
{
	EndFrame();
}

const static FName NAME_${NAME}(TEXT("${NAME}"));

F${NAME}SceneProxy::F${NAME}SceneProxy(U${NAME}Component* InComponent)
	: FPrimitiveSceneProxy(InComponent, NAME_${NAME})
	, VertexFactory(nullptr)
{
	G${NAME}RendererExtension.RegisterExtension();

	// They have some LOD, but considered static as the LODs (are intended to) represent the same static surface.
	// TODO Check if this allows WPO
	bHasDeformableMesh = false;

	UMaterialInterface* ComponentMaterial = InComponent->GetMaterial();
	// TODO MATUSAGE
	const bool bValidMaterial = ComponentMaterial != nullptr && ComponentMaterial->CheckMaterialUsage_Concurrent(MATUSAGE_VirtualHeightfieldMesh);
	Material = bValidMaterial ? ComponentMaterial->GetRenderProxy() : UMaterial::GetDefaultMaterial(MD_Surface)->GetRenderProxy();
	MaterialRelevance = Material->GetMaterialInterface()->GetRelevance_Concurrent(GetScene().GetFeatureLevel());
}

SIZE_T F${NAME}SceneProxy::GetTypeHash() const
{
	static size_t UniquePointer;
	return reinterpret_cast<size_t>(&UniquePointer);
}

uint32 F${NAME}SceneProxy::GetMemoryFootprint() const
{
	return(sizeof(*this) + FPrimitiveSceneProxy::GetAllocatedSize());
}

void F${NAME}SceneProxy::OnTransformChanged()
{
	// TODO
	// UVToLocal = UVToWorld * GetLocalToWorld().Inverse();

	// Setup a default occlusion volume array containing just the primitive bounds.
	// We use this if disabling the full set of occlusion volumes.
	// DefaultOcclusionVolumes.Reset();
	// DefaultOcclusionVolumes.Add(GetBounds());
}

void F${NAME}SceneProxy::CreateRenderThreadResources()
{
	// Gather vertex factory uniform parameters.
	F${NAME}Parameters UniformParams;
	// TODO UNIFORM INIT

	// Create vertex factory.
	VertexFactory = new F${NAME}VertexFactory(GetScene().GetFeatureLevel(), UniformParams);
	VertexFactory->InitResource();
}

void F${NAME}SceneProxy::DestroyRenderThreadResources()
{
	if (VertexFactory != nullptr)
	{
		VertexFactory->ReleaseResource();
		delete VertexFactory;
		VertexFactory = nullptr;
	}
}

FPrimitiveViewRelevance F${NAME}SceneProxy::GetViewRelevance(const FSceneView* View) const
{
	const bool bValid = true; // TODO Allow users to modify
	const bool bIsHiddenInEditor = bHiddenInEditor && View->Family->EngineShowFlags.Editor;

	FPrimitiveViewRelevance Result;
	Result.bDrawRelevance = bValid && IsShown(View) && !bIsHiddenInEditor;
	Result.bShadowRelevance = bValid && IsShadowCast(View) && ShouldRenderInMainPass() &&!bIsHiddenInEditor;
	Result.bDynamicRelevance = true;
	Result.bStaticRelevance = false;
	Result.bRenderInMainPass = ShouldRenderInMainPass();
	Result.bUsesLightingChannels = GetLightingChannelMask() != GetDefaultLightingChannelMask();
	Result.bRenderCustomDepth = ShouldRenderCustomDepth();
	Result.bTranslucentSelfShadow = false;
	Result.bVelocityRelevance = false;
	MaterialRelevance.SetPrimitiveViewRelevance(Result);
	return Result;
}

void F${NAME}SceneProxy::GetDynamicMeshElements(const TArray<const FSceneView*>& Views, const FSceneViewFamily& ViewFamily, uint32 VisibilityMap, FMeshElementCollector& Collector) const
{
	check(IsInRenderingThread());

	if (G${NAME}RendererExtension.IsInFrame())
	{
		// Can't add new work while bInFrame.
		// In UE5 we need to AddWork()/SubmitWork() in two phases: InitViews() and InitViewsAfterPrepass()
		// The main renderer hooks for that don't exist in UE5.0 and are only added in UE5.1
		// That means that for UE5.0 we always hit this for shadow drawing and shadows will not be rendered.
		// Not earlying out here can lead to crashes from buffers being released too soon.
		return;
	}

	for (int32 ViewIndex = 0; ViewIndex < Views.Num(); ViewIndex++)
	{
		if (VisibilityMap & (1 << ViewIndex))
		{
			// TODO INIT instance buffer
			${NAME}Mesh::FDrawInstanceBuffers& Buffers = G${NAME}RendererExtension.AddWork(this, ViewFamily.Views[0], Views[ViewIndex]);

			FMeshBatch& Mesh = Collector.AllocateMesh();
			Mesh.bWireframe = AllowDebugViewmodes() && ViewFamily.EngineShowFlags.Wireframe;
			Mesh.bUseWireframeSelectionColoring = IsSelected();
			Mesh.VertexFactory = VertexFactory;
			Mesh.MaterialRenderProxy = Material;
			Mesh.ReverseCulling = IsLocalToWorldDeterminantNegative();
			Mesh.Type = PT_TriangleList;
			Mesh.DepthPriorityGroup = SDPG_World;
			Mesh.bCanApplyViewModeOverrides = true;
			Mesh.bUseForMaterial = true;
			Mesh.CastShadow = true;
			Mesh.bUseForDepthPass = true;

			Mesh.Elements.SetNumZeroed(1);
			{
				FMeshBatchElement& BatchElement = Mesh.Elements[0];

				// TODO allow for non indirect instanced rendering
				BatchElement.IndexBuffer = VertexFactory->GetIndexBuffer();
				BatchElement.IndirectArgsBuffer = Buffers.IndirectArgsBuffer;
				BatchElement.IndirectArgsOffset = 0;

				BatchElement.FirstIndex = 0;
				BatchElement.NumPrimitives = 0;
				BatchElement.MinVertexIndex = 0;
				BatchElement.MaxVertexIndex = 0;

				BatchElement.PrimitiveIdMode = PrimID_ForceZero;
				BatchElement.PrimitiveUniformBuffer = GetUniformBuffer();

				F${NAME}UserData* UserData = &Collector.AllocateOneFrameResource<F${NAME}UserData>();
				BatchElement.UserData = (void*)UserData;

				UserData->InstanceBufferSRV = Buffers.InstanceBufferSRV;

				FSceneView const* MainView = ViewFamily.Views[0];
				UserData->LodViewOrigin = (FVector3f)MainView->ViewMatrices.GetViewOrigin();	// LWC_TODO: Precision Loss

#if !(UE_BUILD_SHIPPING || UE_BUILD_TEST)
				// Support the freezerendering mode. Use any frozen view state for culling.
				const FViewMatrices* FrozenViewMatrices = MainView->State != nullptr ? MainView->State->GetFrozenViewMatrices() : nullptr;
				if (FrozenViewMatrices != nullptr)
				{
					UserData->LodViewOrigin = (FVector3f)FrozenViewMatrices->GetViewOrigin();
				}
#endif
			}

			Collector.AddMesh(ViewIndex, Mesh);
		}
	}
}

// bool F${NAME}SceneProxy::HasSubprimitiveOcclusionQueries() const
// {
// 	return false;
// }

// const TArray<FBoxSphereBounds>* F${NAME}SceneProxy::GetOcclusionQueries(const FSceneView* View) const
// {
// 	// return &DefaultOcclusionVolumes;
// }

// void F${NAME}SceneProxy::BuildOcclusionVolumes(TArrayView<FVector2D> const& InMinMaxData, FIntPoint const& InMinMaxSize, TArrayView<int32> const& InMinMaxMips, int32 InNumLods)
// {
// 	// TODO
// }

// void F${NAME}SceneProxy::AcceptOcclusionResults(FSceneView const* View, TArray<bool>* Results, int32 ResultsStart, int32 NumResults)
// {
// 	check(IsInRenderingThread());

// 	// TODO
// }

namespace ${NAME}Mesh
{
	/* Keep indirect args offsets in sync with VirtualHeightfieldMesh.usf. */
	static const int32 IndirectArgsByteOffset_FinalCull = 0;
	static const int32 IndirectArgsByteSize = 4 * sizeof(uint32);

	/** Shader structure used for tracking work queues in persistent wave style shaders. Keep in sync with VirtualHeightfieldMesh.ush. */
	struct WorkerQueueInfo
	{
		uint32 Read;
		uint32 Write;
		int32 NumActive;
	};

	struct F${NAME}RenderInstance {
		float Position[3];
	};

	/** Compute shader to initialize all buffers, including adding the lowest mip page(s) to the QuadBuffer. */
	class FInitBuffersVHM_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FInitBuffersVHM_CS);
		SHADER_USE_PARAMETER_STRUCT(FInitBuffersVHM_CS, FGlobalShader);

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER(uint32, MaxLevel)
			SHADER_PARAMETER(uint32, NumForceLoadLods)
			SHADER_PARAMETER(uint32, PageTableFeedbackId)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<WorkerQueueInfo>, RWQueueInfo)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWQueueBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint2>, RWQuadBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWFeedbackBuffer)
		END_SHADER_PARAMETER_STRUCT()

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}
	};

	IMPLEMENT_GLOBAL_SHADER(FInitBuffersVHM_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "InitBuffersCS", SF_Compute);

	/** Compute shader to traverse the virtual texture page table for a view and generate an array of quads to potentially render. */
	class FCollectQuadsVHM_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FCollectQuadsVHM_CS);
		SHADER_USE_PARAMETER_STRUCT(FCollectQuadsVHM_CS, FGlobalShader);

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER_TEXTURE(Texture2D, HeightMinMaxTexture)
			SHADER_PARAMETER_SAMPLER(SamplerState, MinMaxTextureSampler)
			SHADER_PARAMETER(int32, MinMaxLevelOffset)
			SHADER_PARAMETER_TEXTURE(Texture2D, LodBiasMinMaxTexture)
			SHADER_PARAMETER_TEXTURE(Texture2D<float>, OcclusionTexture)
			SHADER_PARAMETER(int32, OcclusionLevelOffset)
			SHADER_PARAMETER_TEXTURE(Texture2D<uint>, PageTableTexture)
			SHADER_PARAMETER(uint32, MaxLevel)
			SHADER_PARAMETER(FVector4f, PageTableSize)
			SHADER_PARAMETER(uint32, PageTableFeedbackId)
			SHADER_PARAMETER(FVector4f, LodDistances)
			SHADER_PARAMETER(float, LodBiasScale)
			SHADER_PARAMETER(FVector3f, ViewOrigin)
			SHADER_PARAMETER_ARRAY(FVector4f, FrustumPlanes, [5])
			SHADER_PARAMETER(FMatrix44f, UVToWorld)
			SHADER_PARAMETER(FVector3f, UVToWorldScale)
			SHADER_PARAMETER(uint32, QueueBufferSizeMask)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<WorkerQueueInfo>, RWQueueInfo)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWQueueBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint2>, RWQuadBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWFeedbackBuffer)
		END_SHADER_PARAMETER_STRUCT()

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}
	};

	IMPLEMENT_GLOBAL_SHADER(FCollectQuadsVHM_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "CollectQuadsCS", SF_Compute);

	/** InitInstanceBuffer compute shader. */
	class FInitInstanceBufferVHM_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FInitInstanceBufferVHM_CS);
		SHADER_USE_PARAMETER_STRUCT(FInitInstanceBufferVHM_CS, FGlobalShader);

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER(int32, NumIndices)
			SHADER_PARAMETER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
		END_SHADER_PARAMETER_STRUCT()

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}
	};

	IMPLEMENT_GLOBAL_SHADER(FInitInstanceBufferVHM_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "InitInstanceBufferCS", SF_Compute);

	/** CullInstances compute shader. */
	class FCullInstancesVHM_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FCullInstancesVHM_CS);
		SHADER_USE_PARAMETER_STRUCT(FCullInstancesVHM_CS, FGlobalShader);

		class FReuseCullDim : SHADER_PERMUTATION_BOOL("REUSE_CULL");

		using FPermutationDomain = TShaderPermutationDomain<FReuseCullDim>;

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER_TEXTURE(Texture2D, HeightMinMaxTexture)
			SHADER_PARAMETER_SAMPLER(SamplerState, MinMaxTextureSampler)
			SHADER_PARAMETER(int32, MinMaxLevelOffset)
			SHADER_PARAMETER_TEXTURE(Texture2D, PageTableTexture)
			SHADER_PARAMETER(FVector4f, PageTableSize)
			SHADER_PARAMETER_ARRAY(FVector4f, FrustumPlanes, [5])
			SHADER_PARAMETER(FVector4f, PhysicalPageTransform)
			SHADER_PARAMETER(uint32, NumPhysicalAddressBits)
			SHADER_PARAMETER_RDG_BUFFER_SRV(Buffer<uint2>, QuadBuffer)
			SHADER_PARAMETER_RDG_BUFFER_SRV(Buffer<uint>, IndirectArgsBufferSRV)
			SHADER_PARAMETER_UAV(RWStructuredBuffer<${NAME}Mesh::F${NAME}RenderInstance>, RWInstanceBuffer)
			SHADER_PARAMETER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
			RDG_BUFFER_ACCESS(IndirectArgsBuffer, ERHIAccess::IndirectArgs)
		END_SHADER_PARAMETER_STRUCT()
	};

	IMPLEMENT_GLOBAL_SHADER(FCullInstancesVHM_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "CullInstancesCS", SF_Compute);


	/** Default Min/Max texture has the fixed maximum [0,1]. */
	class FHeightMinMaxDefaultTexture : public FTexture
	{
	public:
		virtual void InitRHI() override
		{
			FRHIResourceCreateInfo CreateInfo(TEXT("VirtualHeightfieldMesh.MinMaxDefaultTexture"));
			FTexture2DRHIRef Texture2D = RHICreateTexture2D(1, 1, PF_B8G8R8A8, 1, 1, TexCreate_ShaderResource, CreateInfo);
			TextureRHI = Texture2D;

			// Write the contents of the texture.
			uint32 DestStride;
			FColor* DestBuffer = (FColor*)RHILockTexture2D(Texture2D, 0, RLM_WriteOnly, DestStride, false);
			*DestBuffer = FColor(0, 0, 255, 255);
			RHIUnlockTexture2D(Texture2D, 0, false);

			// Create the sampler state RHI resource.
			FSamplerStateInitializerRHI SamplerStateInitializer(SF_Point, AM_Clamp, AM_Clamp, AM_Clamp);
			SamplerStateRHI = GetOrCreateSamplerState(SamplerStateInitializer);
		}

		virtual uint32 GetSizeX() const override { return 1; }
		virtual uint32 GetSizeY() const override { return 1; }
	};

	/** Single global instance of default Min/Max texture. */
	FTexture* GHeightMinMaxDefaultTexture = new TGlobalResource<FHeightMinMaxDefaultTexture>;

	/** View matrices that can be frozen in freezerendering mode. */
	struct FViewData
	{
		FVector ViewOrigin;
		FMatrix ProjectionMatrix;
		FConvexVolume ViewFrustum;
		bool bViewFrozen;
	};

	/** Fill the FViewData from an FSceneView respecting the freezerendering mode. */
	void GetViewData(FSceneView const* InSceneView, FViewData& OutViewData)
	{
#if !(UE_BUILD_SHIPPING || UE_BUILD_TEST)
		const FViewMatrices* FrozenViewMatrices = InSceneView->State != nullptr ? InSceneView->State->GetFrozenViewMatrices() : nullptr;
		if (FrozenViewMatrices != nullptr)
		{
			OutViewData.ViewOrigin = FrozenViewMatrices->GetViewOrigin();
			OutViewData.ProjectionMatrix = FrozenViewMatrices->GetProjectionMatrix();
			GetViewFrustumBounds(OutViewData.ViewFrustum, FrozenViewMatrices->GetViewProjectionMatrix(), true);
			OutViewData.bViewFrozen = true;
		}
		else
#endif
		{
			OutViewData.ViewOrigin = InSceneView->ViewMatrices.GetViewOrigin();
			OutViewData.ProjectionMatrix = InSceneView->ViewMatrices.GetProjectionMatrix();
			OutViewData.ViewFrustum = InSceneView->ViewFrustum;
			OutViewData.bViewFrozen = false;
		}
	}

	/** Structure describing GPU culling setup for a single Proxy. */
	struct FProxyDesc
	{
		FRHITexture* PageTableTexture;
		FRHITexture* HeightMinMaxTexture;
		FRHITexture* LodBiasMinMaxTexture;
		int32 MinMaxLevelOffset;

		uint32 MaxLevel;
		uint32 NumForceLoadLods;
		uint32 PageTableFeedbackId;
		uint32 NumPhysicalAddressBits;
		FVector4 PageTableSize;
		FVector4 PhysicalPageTransform;
		FMatrix UVToWorld;
		FVector UVToWorldScale;
		uint32 NumQuadsPerTileSide;

		int32 MaxPersistentQueueItems;
		int32 MaxRenderItems;
		int32 MaxFeedbackItems;
		int32 NumCollectPassWavefronts;
	};

	/** View description used for LOD calculation in the main view. */
	struct FMainViewDesc
	{
		FSceneView const* ViewDebug;
		FVector ViewOrigin;
		FVector4 LodDistances;
		float LodBiasScale;
		FVector4 Planes[5];
		FTextureRHIRef OcclusionTexture;
		int32 OcclusionLevelOffset;
	};

	/** View description used for culling in the child view. */
	struct FChildViewDesc
	{
		FSceneView const* ViewDebug;
		bool bIsMainView;
		FVector4 Planes[5];
	};

	/** Structure to carry RDG resources. */
	struct FVolatileResources
	{
		FRDGBufferRef QueueInfo;
		FRDGBufferUAVRef QueueInfoUAV;
		FRDGBufferRef QueueBuffer;
		FRDGBufferUAVRef QueueBufferUAV;

		FRDGBufferRef QuadBuffer;
		FRDGBufferUAVRef QuadBufferUAV;
		FRDGBufferSRVRef QuadBufferSRV;

		FRDGBufferRef FeedbackBuffer;
		FRDGBufferUAVRef FeedbackBufferUAV;

		FRDGBufferRef IndirectArgsBuffer;
		FRDGBufferUAVRef IndirectArgsBufferUAV;
		FRDGBufferSRVRef IndirectArgsBufferSRV;
	};

	/** Initialize the FDrawInstanceBuffers objects. */
	void InitializeInstanceBuffers(FRHICommandListImmediate& InRHICmdList, FDrawInstanceBuffers& InBuffers)
	{
		{
			FRHIResourceCreateInfo CreateInfo(TEXT("F${NAME}.InstanceBuffer"));
			const int32 InstanceSize = sizeof(${NAME}Mesh::F${NAME}RenderInstance);
			const int32 InstanceBufferSize = 1024 * 4 * InstanceSize;
			InBuffers.InstanceBuffer = RHICreateStructuredBuffer(InstanceSize, InstanceBufferSize, BUF_UnorderedAccess|BUF_ShaderResource, ERHIAccess::SRVMask, CreateInfo);
			InBuffers.InstanceBufferUAV = RHICreateUnorderedAccessView(InBuffers.InstanceBuffer, false, false);
			InBuffers.InstanceBufferSRV = RHICreateShaderResourceView(InBuffers.InstanceBuffer);
		}
		{
			FRHIResourceCreateInfo CreateInfo(TEXT("F${NAME}.InstanceIndirectArgsBuffer"));
			InBuffers.IndirectArgsBuffer = RHICreateVertexBuffer(5 * sizeof(uint32), BUF_UnorderedAccess|BUF_DrawIndirect, ERHIAccess::IndirectArgs, CreateInfo);
			InBuffers.IndirectArgsBufferUAV = RHICreateUnorderedAccessView(InBuffers.IndirectArgsBuffer, PF_R32_UINT);
		}
	}

	/** Initialize the volatile resources used in the render graph. */
	void InitializeResources(FRDGBuilder& GraphBuilder, FProxyDesc const& InDesc, FMainViewDesc const& InMainViewDesc, FVolatileResources& OutResources)
	{
		OutResources.QueueInfo = GraphBuilder.CreateBuffer(FRDGBufferDesc::CreateStructuredDesc(sizeof(WorkerQueueInfo), 1), TEXT("${NAME}Mesh.QueueInfo"));
		OutResources.QueueInfoUAV = GraphBuilder.CreateUAV(OutResources.QueueInfo);
		OutResources.QueueBuffer = GraphBuilder.CreateBuffer(FRDGBufferDesc::CreateBufferDesc(sizeof(uint32), InDesc.MaxPersistentQueueItems), TEXT("${NAME}Mesh.QuadQueue"));
		OutResources.QueueBufferUAV = GraphBuilder.CreateUAV(FRDGBufferUAVDesc(OutResources.QueueBuffer, PF_R32_UINT));

		OutResources.QuadBuffer = GraphBuilder.CreateBuffer(FRDGBufferDesc::CreateBufferDesc(sizeof(uint32) * 2, InDesc.MaxRenderItems), TEXT("${NAME}Mesh.QuadBuffer"));
		OutResources.QuadBufferUAV = GraphBuilder.CreateUAV(FRDGBufferUAVDesc(OutResources.QuadBuffer, PF_R32G32_UINT));
		OutResources.QuadBufferSRV = GraphBuilder.CreateSRV(FRDGBufferSRVDesc(OutResources.QuadBuffer, PF_R32G32_UINT));

		FRDGBufferDesc FeedbackBufferDesc = FRDGBufferDesc::CreateBufferDesc(sizeof(uint32), InDesc.MaxFeedbackItems + 1);
		FeedbackBufferDesc.Usage = EBufferUsageFlags(FeedbackBufferDesc.Usage | BUF_SourceCopy);
		OutResources.FeedbackBuffer = GraphBuilder.CreateBuffer(FeedbackBufferDesc, TEXT("${NAME}Mesh.FeedbackBuffer"));
		OutResources.FeedbackBufferUAV = GraphBuilder.CreateUAV(FRDGBufferUAVDesc(OutResources.FeedbackBuffer, PF_R32_UINT));

		OutResources.IndirectArgsBuffer = GraphBuilder.CreateBuffer(FRDGBufferDesc::CreateIndirectDesc(IndirectArgsByteSize), TEXT("${NAME}Mesh.IndirectArgsBuffer"));
		OutResources.IndirectArgsBufferUAV = GraphBuilder.CreateUAV(OutResources.IndirectArgsBuffer);
		OutResources.IndirectArgsBufferSRV = GraphBuilder.CreateSRV(OutResources.IndirectArgsBuffer);
	}

	/** Transition our output draw buffers for use. Read or write access is set according to the bToWrite parameter. */
	void AddPass_TransitionAllDrawBuffers(FRDGBuilder& GraphBuilder, TArray<${NAME}Mesh::FDrawInstanceBuffers> const& Buffers, TArrayView<int32> const& BufferIndices, bool bToWrite)
	{
		TArray<FRHIUnorderedAccessView*> OverlapUAVs;
		OverlapUAVs.Reserve(BufferIndices.Num());

		TArray<FRHITransitionInfo> TransitionInfos;
		TransitionInfos.Reserve(BufferIndices.Num() * 2);
		
		for (int32 BufferIndex : BufferIndices)
		{
			FRHIUnorderedAccessView* IndirectArgsBufferUAV = Buffers[BufferIndex].IndirectArgsBufferUAV;
			FRHIUnorderedAccessView* InstanceBufferUAV = Buffers[BufferIndex].InstanceBufferUAV;

			OverlapUAVs.Add(IndirectArgsBufferUAV);

			TransitionInfos.Add(FRHITransitionInfo(IndirectArgsBufferUAV, bToWrite ? ERHIAccess::IndirectArgs : ERHIAccess::UAVMask, bToWrite ? ERHIAccess::UAVMask : ERHIAccess::IndirectArgs));
			TransitionInfos.Add(FRHITransitionInfo(InstanceBufferUAV, bToWrite ? ERHIAccess::SRVMask : ERHIAccess::UAVMask, bToWrite ? ERHIAccess::UAVMask : ERHIAccess::SRVMask));
		}

		AddPass(GraphBuilder, RDG_EVENT_NAME("TransitionAllDrawBuffers"), [bToWrite, OverlapUAVs, TransitionInfos](FRHICommandList& InRHICmdList)
		{
			if (!bToWrite)
			{
				InRHICmdList.EndUAVOverlap(OverlapUAVs);
			}

			InRHICmdList.Transition(TransitionInfos);
			
			if (bToWrite)
			{
				InRHICmdList.BeginUAVOverlap(OverlapUAVs);
			}
		});
	}

	/** Initialize the buffers before collecting visible quads. */
	void AddPass_InitBuffers(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FProxyDesc const& InDesc, FVolatileResources& InVolatileResources)
	{
		TShaderMapRef<FInitBuffersVHM_CS> ComputeShader(InGlobalShaderMap);

		FInitBuffersVHM_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FInitBuffersVHM_CS::FParameters>();
		PassParameters->MaxLevel = InDesc.MaxLevel;
		PassParameters->NumForceLoadLods = InDesc.NumForceLoadLods;
		PassParameters->PageTableFeedbackId = InDesc.PageTableFeedbackId;
		PassParameters->RWQueueInfo = InVolatileResources.QueueInfoUAV;
		PassParameters->RWQueueBuffer = InVolatileResources.QueueBufferUAV;
		PassParameters->RWQuadBuffer = InVolatileResources.QuadBufferUAV;
		PassParameters->RWIndirectArgsBuffer = InVolatileResources.IndirectArgsBufferUAV;
		PassParameters->RWFeedbackBuffer = InVolatileResources.FeedbackBufferUAV;

		GraphBuilder.AddPass(
			RDG_EVENT_NAME("InitBuffers"),
			PassParameters,
			ERDGPassFlags::Compute,
			[PassParameters, ComputeShader](FRHICommandList& RHICmdList)
		{
			//todo: If feedback parsing understands append counter we don't need to fully clear
			RHICmdList.ClearUAVUint(PassParameters->RWFeedbackBuffer->GetRHI(), FUintVector4(0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff));

			FComputeShaderUtils::Dispatch(RHICmdList, ComputeShader, *PassParameters, FIntVector(1, 1, 1));
		});
	}

	/** Collect potentially visible quads and determine their Lods. */
	void AddPass_CollectQuads(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FProxyDesc const& InDesc, FVolatileResources& InVolatileResources, FMainViewDesc const& InViewDesc)
	{
		TShaderMapRef<FCollectQuadsVHM_CS> ComputeShader(InGlobalShaderMap);

		FCollectQuadsVHM_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FCollectQuadsVHM_CS::FParameters>();
		PassParameters->HeightMinMaxTexture = InDesc.HeightMinMaxTexture;
		PassParameters->LodBiasMinMaxTexture = InDesc.LodBiasMinMaxTexture;
		PassParameters->MinMaxTextureSampler = TStaticSamplerState<SF_Point>::GetRHI();
		PassParameters->MinMaxLevelOffset = InDesc.MinMaxLevelOffset;
		PassParameters->OcclusionTexture = InViewDesc.OcclusionTexture;
		PassParameters->OcclusionLevelOffset = InViewDesc.OcclusionLevelOffset;
		PassParameters->PageTableTexture = InDesc.PageTableTexture;
		PassParameters->MaxLevel = InDesc.MaxLevel;
		PassParameters->PageTableSize = FVector4f(InDesc.PageTableSize); // LWC_TODO: precision loss
		PassParameters->PageTableFeedbackId = InDesc.PageTableFeedbackId;
		PassParameters->UVToWorld = FMatrix44f(InDesc.UVToWorld);		// LWC_TODO: Precision loss
		PassParameters->UVToWorldScale = (FVector3f)InDesc.UVToWorldScale;
		PassParameters->ViewOrigin = (FVector3f)InViewDesc.ViewOrigin;
		PassParameters->LodDistances = FVector4f(InViewDesc.LodDistances); // LWC_TODO: precision loss
		PassParameters->LodBiasScale = InViewDesc.LodBiasScale;
		for (int32 PlaneIndex = 0; PlaneIndex < 5; ++PlaneIndex)
		{
			PassParameters->FrustumPlanes[PlaneIndex] = FVector4f(InViewDesc.Planes[PlaneIndex]); // LWC_TODO: precision loss
		}
		PassParameters->QueueBufferSizeMask = InDesc.MaxPersistentQueueItems - 1; // Assumes MaxPersistentQueueItems is a power of 2 so that we can wrap with a mask.
		PassParameters->RWQueueInfo = InVolatileResources.QueueInfoUAV;
		PassParameters->RWQueueBuffer = InVolatileResources.QueueBufferUAV;
		PassParameters->RWQuadBuffer = InVolatileResources.QuadBufferUAV;
		PassParameters->RWIndirectArgsBuffer = InVolatileResources.IndirectArgsBufferUAV;
		PassParameters->RWFeedbackBuffer = InVolatileResources.FeedbackBufferUAV;

		FComputeShaderUtils::AddPass(
			GraphBuilder,
			RDG_EVENT_NAME("CollectQuads"),
			ComputeShader, PassParameters, FIntVector(InDesc.NumCollectPassWavefronts, 1, 1));
	}

	/** Initialise the draw indirect buffer. */
	void AddPass_InitInstanceBuffer(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FDrawInstanceBuffers& InOutputResources)
	{
		TShaderMapRef<FInitInstanceBufferVHM_CS> ComputeShader(InGlobalShaderMap);

		FInitInstanceBufferVHM_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FInitInstanceBufferVHM_CS::FParameters>();
		PassParameters->NumIndices = 3;
		PassParameters->RWIndirectArgsBuffer = InOutputResources.IndirectArgsBufferUAV;

 		FComputeShaderUtils::AddPass(
 			GraphBuilder,
 			RDG_EVENT_NAME("InitInstanceBuffer"),
 			ComputeShader, PassParameters, FIntVector(1, 1, 1));
	}

	/** Cull quads and write to the final output buffer. */
	void AddPass_CullInstances(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FProxyDesc const& InDesc, FVolatileResources& InVolatileResources, FDrawInstanceBuffers& InOutputResources, FChildViewDesc const& InViewDesc)
	{
		FCullInstancesVHM_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FCullInstancesVHM_CS::FParameters>();
		// PassParameters->HeightMinMaxTexture = InDesc.HeightMinMaxTexture;y
		// PassParameters->MinMaxTextureSampler = TStaticSamplerState<SF_Point>::GetRHI();
		// PassParameters->MinMaxLevelOffset = InDesc.MinMaxLevelOffset;
		// PassParameters->PageTableTexture = InDesc.PageTableTexture;
		// PassParameters->PageTableSize = FVector4f(InDesc.PageTableSize); // LWC_TODO: precision loss
		// for (int32 PlaneIndex = 0; PlaneIndex < 5; ++PlaneIndex)
		// {
		// 	PassParameters->FrustumPlanes[PlaneIndex] = FVector4f(InViewDesc.Planes[PlaneIndex]); // LWC_TODO: precision loss
		// }
		// PassParameters->PhysicalPageTransform = FVector4f(InDesc.PhysicalPageTransform); // LWC_TODO: precision loss
		// PassParameters->NumPhysicalAddressBits = InDesc.NumPhysicalAddressBits;
		PassParameters->QuadBuffer = InVolatileResources.QuadBufferSRV;
		PassParameters->IndirectArgsBuffer = InVolatileResources.IndirectArgsBuffer;
		PassParameters->IndirectArgsBufferSRV = InVolatileResources.IndirectArgsBufferSRV;
		PassParameters->RWInstanceBuffer = InOutputResources.InstanceBufferUAV;
		PassParameters->RWIndirectArgsBuffer = InOutputResources.IndirectArgsBufferUAV;

		int32 IndirectArgOffset = ${NAME}Mesh::IndirectArgsByteOffset_FinalCull;

		FCullInstancesVHM_CS::FPermutationDomain PermutationVector;
		PermutationVector.Set<FCullInstancesVHM_CS::FReuseCullDim>(InViewDesc.bIsMainView);

		TShaderMapRef<FCullInstancesVHM_CS> ComputeShader(InGlobalShaderMap, PermutationVector);
		FComputeShaderUtils::AddPass(
			GraphBuilder,
			RDG_EVENT_NAME("CullInstances"),
			ComputeShader, PassParameters,
			InVolatileResources.IndirectArgsBuffer,
			IndirectArgOffset);
	}
}

void F${NAME}RendererExtension::SubmitWork(FRDGBuilder& GraphBuilder)
{
	// SCOPE_CYCLE_COUNTER(STAT_${NAME}Mesh_SubmitWork);
	// DECLARE_GPU_STAT(${NAME}Mesh)
	// RDG_EVENT_SCOPE(GraphBuilder, "${NAME}");
	// RDG_GPU_STAT_SCOPE(GraphBuilder, ${NAME}Mesh);

	// Sort work so that we can batch by proxy/view
	WorkDescs.Sort(FWorkDescSort());

	// Add pass to transition all output buffers for writing
	TArray<int32, TInlineAllocator<8>> UsedBufferIndices;
	for (FWorkDesc WorkdDesc : WorkDescs)
	{
		UsedBufferIndices.Add(WorkdDesc.BufferIndex);
	}
	AddPass_TransitionAllDrawBuffers(GraphBuilder, Buffers, UsedBufferIndices, true);

	// Add passes to initialize the output buffers
	for (FWorkDesc WorkDesc : WorkDescs)
	{
		AddPass_InitInstanceBuffer(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), Buffers[WorkDesc.BufferIndex]);
	}

	// Iterate workloads and submit work
	const int32 NumWorkItems = WorkDescs.Num();
	int32 WorkIndex = 0;
	while (WorkIndex < NumWorkItems)
	{
		// Gather data per proxy
		F${NAME}SceneProxy const* Proxy = SceneProxies[WorkDescs[WorkIndex].ProxyIndex];
		// IAllocatedVirtualTexture* AllocatedVirtualTexture = Proxy->AllocatedVirtualTexture;
			
		// const float PageSize = AllocatedVirtualTexture->GetVirtualTileSize();
		// const float PageBorderSize = AllocatedVirtualTexture->GetTileBorderSize();
		// const float PageAndBorderSize = PageSize + PageBorderSize * 2.f;
		// const float HalfTexelSize = 0.5f;
		// const float PhysicalTextureSize = AllocatedVirtualTexture->GetPhysicalTextureSize(0);
		// const FVector4 PhysicalPageTransform = FVector4(PageAndBorderSize, PageSize, PageBorderSize, HalfTexelSize) * (1.f / PhysicalTextureSize);

		// const float PageTableSizeX = AllocatedVirtualTexture->GetWidthInTiles();
		// const float PageTableSizeY = AllocatedVirtualTexture->GetHeightInTiles();
		// const FVector4 PageTableSize = FVector4(PageTableSizeX, PageTableSizeY, 1.f / PageTableSizeX, 1.f / PageTableSizeY);

		${NAME}Mesh::FProxyDesc ProxyDesc;
		// ProxyDesc.PageTableTexture = AllocatedVirtualTexture->GetPageTableTexture(0);

		// 1 << CeilLogTwo takes a number and returns the next power of two. so: 53 -> 64, 80 -> 128, etc.
		ProxyDesc.MaxPersistentQueueItems = 1 << FMath::CeilLogTwo(1024 * 4);
		ProxyDesc.MaxRenderItems = 1024 * 4;
		// ProxyDesc.MaxFeedbackItems = CVarVHMMaxFeedbackItems.GetValueOnRenderThread();
		ProxyDesc.NumCollectPassWavefronts = 16;

		while (WorkIndex < NumWorkItems && SceneProxies[WorkDescs[WorkIndex].ProxyIndex] == Proxy)
		{
			// Gather data per main view
			FSceneView const* MainView = MainViews[WorkDescs[WorkIndex].MainViewIndex];
				
			${NAME}Mesh::FViewData MainViewData;
			${NAME}Mesh::GetViewData(MainView, MainViewData);

			${NAME}Mesh::FMainViewDesc MainViewDesc;
			MainViewDesc.ViewDebug = MainView;

			// ViewOrigin and Frustum Planes are all converted to UV space for the shader.
			MainViewDesc.ViewOrigin = MainViewData.ViewOrigin;
			// MainViewDesc.LodDistances = FVector4(VirtualHeightfieldMesh::CalculateLodRanges(MainView, Proxy));
			// MainViewDesc.LodBiasScale = Proxy->LodBiasScale;

			// const int32 MainViewNumPlanes = FMath::Min(MainViewData.ViewFrustum.Planes.Num(), 5);
			// for (int32 PlaneIndex = 0; PlaneIndex < MainViewNumPlanes; ++PlaneIndex)
			// {
			// 	FPlane Plane = MainViewData.ViewFrustum.Planes[PlaneIndex];
			// 	Plane = ${NAME}Mesh::TransformPlane(Plane, Proxy->WorldToUV, Proxy->WorldToUVTransposeAdjoint);
			// 	MainViewDesc.Planes[PlaneIndex] = ${NAME}Mesh::ConvertPlane(Plane);
			// }
			// for (int32 PlaneIndex = MainViewNumPlanes; PlaneIndex < 5; ++PlaneIndex)
			// {
			// 	MainViewDesc.Planes[PlaneIndex] = FPlane(0, 0, 0, 1); // Null plane won't cull anything
			// }

			// FOcclusionResults* OcclusionResults = GOcclusionResults.Find(FOcclusionResultsKey(Proxy, MainView));
			// if (OcclusionResults == nullptr)
			// {
			// 	MainViewDesc.OcclusionTexture = GBlackTexture->TextureRHI;
			// 	MainViewDesc.OcclusionLevelOffset = (int32)ProxyDesc.MaxLevel;
			// }
			// else
			// {
			// 	MainViewDesc.OcclusionTexture = OcclusionResults->OcclusionTexture;
			// 	MainViewDesc.OcclusionLevelOffset = (int32)ProxyDesc.MaxLevel - OcclusionResults->NumTextureMips + 1;
			// }

			// Build volatile graph resources
			${NAME}Mesh::FVolatileResources VolatileResources;
			${NAME}Mesh::InitializeResources(GraphBuilder, ProxyDesc, MainViewDesc, VolatileResources);

			// Build graph
			${NAME}Mesh::AddPass_InitBuffers(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), ProxyDesc, VolatileResources);
			${NAME}Mesh::AddPass_CollectQuads(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), ProxyDesc, VolatileResources, MainViewDesc);

			// FVirtualTextureFeedbackBufferDesc Desc;
 			// Desc.Init(CVarVHMMaxFeedbackItems.GetValueOnRenderThread() + 1);
 			// SubmitVirtualTextureFeedbackBuffer(GraphBuilder, VolatileResources.FeedbackBuffer, Desc);

			while (WorkIndex < NumWorkItems && MainViews[WorkDescs[WorkIndex].MainViewIndex] == MainView)
			{
				// Gather data per child view
				FSceneView const* CullView = CullViews[WorkDescs[WorkIndex].CullViewIndex];
				FConvexVolume const* ShadowFrustum = CullView->GetDynamicMeshElementsShadowCullFrustum();
				FConvexVolume const& Frustum = ShadowFrustum != nullptr && ShadowFrustum->Planes.Num() > 0 ? *ShadowFrustum : CullView->ViewFrustum;
				const FVector PreShadowTranslation = ShadowFrustum != nullptr ? CullView->GetPreShadowTranslation() : FVector::ZeroVector;

				${NAME}Mesh::FChildViewDesc ChildViewDesc;
				ChildViewDesc.ViewDebug = MainView;
				ChildViewDesc.bIsMainView = CullView == MainView;
					
				// const int32 ChildViewNumPlanes = FMath::Min(Frustum.Planes.Num(), 5);
				// for (int32 PlaneIndex = 0; PlaneIndex < ChildViewNumPlanes; ++PlaneIndex)
				// {
				// 	FPlane Plane = Frustum.Planes[PlaneIndex];
				// 	Plane = VirtualHeightfieldMesh::TranslatePlane(Plane, PreShadowTranslation);
				// 	Plane = VirtualHeightfieldMesh::TransformPlane(Plane, Proxy->WorldToUV, Proxy->WorldToUVTransposeAdjoint);
				// 	ChildViewDesc.Planes[PlaneIndex] = VirtualHeightfieldMesh::ConvertPlane(Plane);
				// }
				// for (int32 PlaneIndex = ChildViewNumPlanes; PlaneIndex < 5; ++PlaneIndex)
				// {
				// 	MainViewDesc.Planes[PlaneIndex] = FPlane(0, 0, 0, 1); // Null plane won't cull anything
				// }

				// Build graph
				${NAME}Mesh::AddPass_CullInstances(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), ProxyDesc, VolatileResources, Buffers[WorkDescs[WorkIndex].BufferIndex], ChildViewDesc);

				WorkIndex++;
			}
		}
	}

	// Add pass to transition all output buffers for reading
	AddPass_TransitionAllDrawBuffers(GraphBuilder, Buffers, UsedBufferIndices, false);
}
