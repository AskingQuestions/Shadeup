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

// This is the max number of instances that can be stored and rendered, attempting to add instances past this will overwrite the oldest instance
#define MAX_INSTANCES 1024

DECLARE_STATS_GROUP(TEXT("${NAME}Mesh"), STATGROUP_${NAME}Mesh, STATCAT_Advanced);
DECLARE_CYCLE_STAT(TEXT("${NAME}Mesh SubmitWork"), STAT_${NAME}Mesh_SubmitWork, STATGROUP_${NAME}Mesh);

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
	, AddInstancesNextFrame(true)
{
	bIsMeshValid = true;

	G${NAME}RendererExtension.RegisterExtension();

	if (!IsValid(InComponent->GetStaticMesh())) {
		bIsMeshValid = false;
		return;
	}

	// They have some LOD, but considered static as the LODs (are intended to) represent the same static surface.
	// TODO Check if this allows WPO
	bHasDeformableMesh = false;

	LODIndex = InComponent->LODIndex;

	UMaterialInterface* ComponentMaterial = InComponent->GetMaterial();
	LocalStaticMesh = InComponent->GetStaticMesh();

	RenderData = LocalStaticMesh->GetRenderData();

	if (!(RenderData && RenderData->LODResources.Num() > 0)) {
		RenderData = nullptr;
		bIsMeshValid = false;
		return;
	}
	
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
	if (!bIsMeshValid) return;

	const FStaticMeshLODResources& LODModel = RenderData->LODResources[LODIndex];

	// Create vertex factory.
	VertexFactory = new F${NAME}MeshVertexFactory(GetScene().GetFeatureLevel());
	VertexFactory->InitResource();

	LODModel.VertexBuffers.PositionVertexBuffer.BindPositionVertexBuffer(VertexFactory, StaticMeshData);
	LODModel.VertexBuffers.StaticMeshVertexBuffer.BindTangentVertexBuffer(VertexFactory, StaticMeshData);
	LODModel.VertexBuffers.StaticMeshVertexBuffer.BindTexCoordVertexBuffer(VertexFactory, StaticMeshData, MAX_TEXCOORDS);

	VertexFactory->SetData(StaticMeshData);

	VertexFactoryUniformBuffer = CreateVFUniformBuffer();
	VertexFactory->SetUniformBuffer(VertexFactoryUniformBuffer);
}

void F${NAME}SceneProxy::DestroyRenderThreadResources()
{
	if (RenderData)
	{
		RenderData = nullptr;
	}

	UniformBufferStore.ReleaseResource();

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
	const bool bIsHiddenInEditor = false && View->Family->EngineShowFlags.Editor;

	FPrimitiveViewRelevance Result;
	Result.bDrawRelevance = bValid && IsShown(View) && !bIsHiddenInEditor;
	Result.bShadowRelevance = bValid && IsShadowCast(View) && ShouldRenderInMainPass() && !bIsHiddenInEditor;
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

F${NAME}MeshUniformBufferRef F${NAME}SceneProxy::CreateVFUniformBuffer() const
{
	// Compute the vertex factory uniform buffer.
	F${NAME}MeshUniformParameters Params;
	FMemory::Memzero(&Params, sizeof(Params)); // Clear unset bytes

	const int32 NumTexCoords = VertexFactory->GetNumTexcoords();
	const int32 ColorIndexMask = VertexFactory->GetColorIndexMask();

	Params.VertexFetch_Parameters = { ColorIndexMask, NumTexCoords, INDEX_NONE, INDEX_NONE };
	Params.VertexFetch_TexCoordBuffer = VertexFactory->GetTextureCoordinatesSRV();
	Params.VertexFetch_PackedTangentsBuffer = VertexFactory->GetTangentsSRV();
	Params.VertexFetch_ColorComponentsBuffer = VertexFactory->GetColorComponentsSRV();

	return F${NAME}MeshUniformBufferRef::CreateUniformBufferImmediate(Params, UniformBuffer_MultiFrame);
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

	if (!bIsMeshValid) {
		return;
	}
	
	const FStaticMeshLODResources& LODModel = RenderData->LODResources[LODIndex];

	const int32 SectionCount = LODModel.Sections.Num();

	bool bHasPrecomputedVolumetricLightmap;
	FMatrix PreviousLocalToWorld;
	int32 SingleCaptureIndex;
	bool bOutputVelocity;
	FPrimitiveSceneInfo* LocalPrimitiveSceneInfo = GetPrimitiveSceneInfo();
	GetScene().GetPrimitiveUniformShaderParameters_RenderThread(LocalPrimitiveSceneInfo, bHasPrecomputedVolumetricLightmap, PreviousLocalToWorld, SingleCaptureIndex, bOutputVelocity);

	FBox InstanceBounds(FVector(-10, -10, -10), FVector(10, 10, 10));

	TUniformBuffer<FPrimitiveUniformShaderParameters>& CustomUB = UniformBufferStore;

	if (!CustomUB.IsInitialized())
	{
		FPrimitiveUniformShaderParametersBuilder UBBuilder = FPrimitiveUniformShaderParametersBuilder()
			.Defaults()
				.LocalToWorld(GetLocalToWorld())
				.PreviousLocalToWorld(PreviousLocalToWorld)
				.ActorWorldPosition(GetActorPosition())
				.WorldBounds(GetBounds())
				.LocalBounds(GetLocalBounds())
				.CustomPrimitiveData(GetCustomPrimitiveData())
				.LightingChannelMask(GetLightingChannelMask())
				.LightmapDataIndex(LocalPrimitiveSceneInfo ? LocalPrimitiveSceneInfo->GetLightmapDataOffset() : 0)
				.LightmapUVIndex(GetLightMapCoordinateIndex())
				.SingleCaptureIndex(SingleCaptureIndex)
				.InstanceSceneDataOffset(LocalPrimitiveSceneInfo ? LocalPrimitiveSceneInfo->GetInstanceSceneDataOffset() : INDEX_NONE)
				.NumInstanceSceneDataEntries(LocalPrimitiveSceneInfo ? LocalPrimitiveSceneInfo->GetNumInstanceSceneDataEntries() : 0)
				.InstancePayloadDataOffset(LocalPrimitiveSceneInfo ? LocalPrimitiveSceneInfo->GetInstancePayloadDataOffset() : INDEX_NONE)
				.InstancePayloadDataStride(LocalPrimitiveSceneInfo ? LocalPrimitiveSceneInfo->GetInstancePayloadDataStride() : 0)
				.ReceivesDecals(ReceivesDecals())
				.DrawsVelocity(DrawsVelocity())
				.OutputVelocity(bOutputVelocity || AlwaysHasVelocity())
				.CastContactShadow(CastsContactShadow())
				.CastShadow(CastsDynamicShadow())
				.HasCapsuleRepresentation(HasDynamicIndirectShadowCasterRepresentation())
				.UseVolumetricLightmap(bHasPrecomputedVolumetricLightmap)
				.UseSingleSampleShadowFromStationaryLights(UseSingleSampleShadowFromStationaryLights());
		if ( InstanceBounds.IsValid )
		{
			UBBuilder.InstanceLocalBounds(InstanceBounds);

			// TODO: Is this correct anymore? With instance bounds, seems not. Left in for legacy
			UBBuilder.PreSkinnedLocalBounds(InstanceBounds);
		}

		CustomUB.SetContents(UBBuilder.Build());
		CustomUB.InitResource();
	}

	for (int32 ViewIndex = 0; ViewIndex < Views.Num(); ViewIndex++)
	{
		if (VisibilityMap & (1 << ViewIndex))
		{
			// TODO INIT instance buffer
			${NAME}Mesh::FDrawInstanceBuffers& Buffers = G${NAME}RendererExtension.AddWork(this, ViewFamily.Views[0], Views[ViewIndex]);

			for (int32 SectionIndex = 0; SectionIndex < SectionCount; SectionIndex++)
			{
				const FStaticMeshSection& Section = LODModel.Sections[SectionIndex];

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
					
					BatchElement.IndirectArgsBuffer = Buffers.IndirectArgsBuffer;
					BatchElement.IndirectArgsOffset = 0;

					BatchElement.FirstIndex = 0;
					BatchElement.NumPrimitives = 0;
					BatchElement.MinVertexIndex = 0;
					BatchElement.MaxVertexIndex = 0;

					BatchElement.IndexBuffer = &LODModel.IndexBuffer;
					BatchElement.FirstIndex = Section.FirstIndex;
					// BatchElement.NumPrimitives = Section.NumTriangles;

					BatchElement.PrimitiveUniformBufferResource = &CustomUB;

					F${NAME}UserData* UserData = &Collector.AllocateOneFrameResource<F${NAME}UserData>();
					BatchElement.UserData = (void*)UserData;

					UserData->InstanceBufferSRV = Buffers.InstanceBufferSRV;
				}

				Collector.AddMesh(ViewIndex, Mesh);
			}
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

	/** Shader structure used for tracking instance counts on the GPU. */
	struct InstanceInfo
	{
		uint32 Num;
	};

	struct F${NAME}RenderInstance {
		float Position[3];
	};

	struct F${NAME}MeshItem {
		float Position[3];
		float Rotation[3];
		float Scale[3];
	};

	/** Compute shader to initialize all buffers. */
	class FInitBuffers_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FInitBuffers_CS);
		SHADER_USE_PARAMETER_STRUCT(FInitBuffers_CS, FGlobalShader);

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<InstanceInfo>, RWInstanceInfo)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<F${NAME}MeshItem>, RWMeshBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWFeedbackBuffer)
			SHADER_PARAMETER(uint32, InstanceBufferSize)
			SHADER_PARAMETER(float, Time)
		END_SHADER_PARAMETER_STRUCT()

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}
	};

	IMPLEMENT_GLOBAL_SHADER(FInitBuffers_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "InitBuffersCS", SF_Compute);

	/** Compute shader to add an arbitrary amount of instances to the persistent BaseInstanceBuffer. */
	class FAddInstances_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FAddInstances_CS);
		SHADER_USE_PARAMETER_STRUCT(FAddInstances_CS, FGlobalShader);

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER(FVector3f, ViewOrigin)
			SHADER_PARAMETER_ARRAY(FVector4f, FrustumPlanes, [5])
			SHADER_PARAMETER(uint32, NumToAdd)
			SHADER_PARAMETER(int32, Seed)
			SHADER_PARAMETER(uint32, InstanceBufferSize)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<InstanceInfo>, RWInstanceInfo)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<F${NAME}MeshItem>, RWBaseInstanceBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<F${NAME}MeshItem>, RWMeshBuffer)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
		END_SHADER_PARAMETER_STRUCT()

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}
	};

	IMPLEMENT_GLOBAL_SHADER(FAddInstances_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "AddInstancesCS", SF_Compute);

	/** InitInstanceBuffer compute shader. */
	class FInitInstanceBuffer_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FInitInstanceBuffer_CS);
		SHADER_USE_PARAMETER_STRUCT(FInitInstanceBuffer_CS, FGlobalShader);

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER(int32, NumIndices)
			SHADER_PARAMETER(uint32, InstanceBufferSize)
			SHADER_PARAMETER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
		END_SHADER_PARAMETER_STRUCT()

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}
	};

	IMPLEMENT_GLOBAL_SHADER(FInitInstanceBuffer_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "InitInstanceBufferCS", SF_Compute);

	/** CullInstances compute shader. */
	class FCullInstances_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FCullInstances_CS);
		SHADER_USE_PARAMETER_STRUCT(FCullInstances_CS, FGlobalShader);

		class FReuseCullDim : SHADER_PERMUTATION_BOOL("REUSE_CULL");

		using FPermutationDomain = TShaderPermutationDomain<FReuseCullDim>;

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER_ARRAY(FVector4f, FrustumPlanes, [5])
			SHADER_PARAMETER(FVector3f, ViewOrigin)
			SHADER_PARAMETER_RDG_BUFFER_SRV(StructuredBuffer<F${NAME}MeshItem>, BaseInstanceBuffer)
			SHADER_PARAMETER_RDG_BUFFER_SRV(StructuredBuffer<F${NAME}MeshItem>, MeshBuffer)
			SHADER_PARAMETER_RDG_BUFFER_SRV(Buffer<uint>, IndirectArgsBufferSRV)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<F${NAME}MeshItem>, RWBaseInstanceBuffer)
			SHADER_PARAMETER_UAV(RWStructuredBuffer<F${NAME}MeshItem>, RWInstanceBuffer)
			SHADER_PARAMETER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
			RDG_BUFFER_ACCESS(IndirectArgsBuffer, ERHIAccess::IndirectArgs)
		END_SHADER_PARAMETER_STRUCT()
	};

	IMPLEMENT_GLOBAL_SHADER(FCullInstances_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "CullInstancesCS", SF_Compute);

	/** PushInstances compute shader. */
	class FPushInstances_CS : public FGlobalShader
	{
	public:
		DECLARE_GLOBAL_SHADER(FPushInstances_CS);
		SHADER_USE_PARAMETER_STRUCT(FPushInstances_CS, FGlobalShader);

		static bool ShouldCompilePermutation(FGlobalShaderPermutationParameters const& Parameters)
		{
			return IsFeatureLevelSupported(Parameters.Platform, ERHIFeatureLevel::SM5);
		}

		BEGIN_SHADER_PARAMETER_STRUCT(FParameters, )
			SHADER_PARAMETER(FVector3f, ViewOrigin)
			SHADER_PARAMETER_RDG_BUFFER_SRV(Buffer<uint>, IndirectArgsBufferSRV)
			SHADER_PARAMETER_RDG_BUFFER_UAV(RWStructuredBuffer<F${NAME}MeshItem>, RWBaseInstanceBuffer)
			SHADER_PARAMETER_UAV(RWBuffer<uint>, RWIndirectArgsBuffer)
			RDG_BUFFER_ACCESS(IndirectArgsBuffer, ERHIAccess::IndirectArgs)
		END_SHADER_PARAMETER_STRUCT()
	};

	IMPLEMENT_GLOBAL_SHADER(FPushInstances_CS, "/${MODULE_NAME}Shaders/${NAME}/${NAME}Compute.usf", "PushInstancesCS", SF_Compute);

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
		F${NAME}SceneProxy const* SceneProxy;
		int32 MaxPersistentQueueItems;
		int32 MaxRenderItems;
		int32 NumAddPassWavefronts;
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
		FRDGBufferRef BaseInstanceBuffer;
		FRDGBufferUAVRef BaseInstanceBufferUAV;
		FRDGBufferSRVRef BaseInstanceBufferSRV;

		FRDGBufferRef InstanceInfoBuffer;
		FRDGBufferUAVRef InstanceInfoBufferUAV;
		FRDGBufferSRVRef InstanceInfoBufferSRV;

		FRDGBufferRef MeshBuffer;
		FRDGBufferUAVRef MeshBufferUAV;
		FRDGBufferSRVRef MeshBufferSRV;

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
		if (!InDesc.SceneProxy->BaseInstanceBuffer.IsValid()) {
			// We need to create the instance buffers.
			OutResources.BaseInstanceBuffer = GraphBuilder.CreateBuffer(FRDGBufferDesc::CreateStructuredDesc(sizeof(F${NAME}MeshItem), InDesc.MaxRenderItems), TEXT("${NAME}Mesh.BaseInstanceBuffer"));
			OutResources.InstanceInfoBuffer = GraphBuilder.CreateBuffer(FRDGBufferDesc::CreateStructuredDesc(sizeof(InstanceInfo), 1), TEXT("${NAME}Mesh.InstanceInfoBuffer"));

			InDesc.SceneProxy->BaseInstanceBuffer = GraphBuilder.ConvertToExternalBuffer(OutResources.BaseInstanceBuffer);
			InDesc.SceneProxy->InstanceInfoBuffer = GraphBuilder.ConvertToExternalBuffer(OutResources.InstanceInfoBuffer);
		} else {
			// Buffers already exist, we can use them.
			OutResources.BaseInstanceBuffer = GraphBuilder.RegisterExternalBuffer(InDesc.SceneProxy->BaseInstanceBuffer);
			OutResources.InstanceInfoBuffer = GraphBuilder.RegisterExternalBuffer(InDesc.SceneProxy->InstanceInfoBuffer);
		}

		OutResources.BaseInstanceBufferUAV = GraphBuilder.CreateUAV(OutResources.BaseInstanceBuffer);
		OutResources.BaseInstanceBufferSRV = GraphBuilder.CreateSRV(OutResources.BaseInstanceBuffer);

		OutResources.InstanceInfoBufferUAV = GraphBuilder.CreateUAV(OutResources.InstanceInfoBuffer);
		OutResources.InstanceInfoBufferSRV = GraphBuilder.CreateSRV(OutResources.InstanceInfoBuffer);

		OutResources.MeshBuffer = GraphBuilder.CreateBuffer(FRDGBufferDesc::CreateStructuredDesc(sizeof(F${NAME}MeshItem), InDesc.MaxRenderItems), TEXT("${NAME}Mesh.MeshBuffer"));
		OutResources.MeshBufferUAV = GraphBuilder.CreateUAV(OutResources.MeshBuffer);
		OutResources.MeshBufferSRV = GraphBuilder.CreateSRV(OutResources.MeshBuffer);

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

	/** Initialize the buffers before collecting visible meshes. */
	void AddPass_InitBuffers(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FProxyDesc const& InDesc, FVolatileResources& InVolatileResources)
	{
		TShaderMapRef<FInitBuffers_CS> ComputeShader(InGlobalShaderMap);

		FInitBuffers_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FInitBuffers_CS::FParameters>();
		PassParameters->Time = (float) (rand() % 1000) / 50.f;
		PassParameters->RWInstanceInfo = InVolatileResources.InstanceInfoBufferUAV;
		PassParameters->RWMeshBuffer = InVolatileResources.MeshBufferUAV;
		PassParameters->RWIndirectArgsBuffer = InVolatileResources.IndirectArgsBufferUAV;
		PassParameters->InstanceBufferSize = InDesc.MaxRenderItems;

		GraphBuilder.AddPass(
			RDG_EVENT_NAME("InitBuffers"),
			PassParameters,
			ERDGPassFlags::Compute,
			[PassParameters, ComputeShader](FRHICommandList& RHICmdList)
		{
			FComputeShaderUtils::Dispatch(RHICmdList, ComputeShader, *PassParameters, FIntVector(1, 1, 1));
		});
	}

	/** Collect potentially visible quads and determine their Lods. */
	void AddPass_AddInstances(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FProxyDesc const& InDesc, FVolatileResources& InVolatileResources, FMainViewDesc const& InViewDesc)
	{
		int NumToAdd = 100;

		TShaderMapRef<FAddInstances_CS> ComputeShader(InGlobalShaderMap);

		FAddInstances_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FAddInstances_CS::FParameters>();
		PassParameters->ViewOrigin = (FVector3f)FVector(InDesc.SceneProxy->GetLocalToWorld().Inverse().TransformPosition((FVector3f)InViewDesc.ViewOrigin));
		for (int32 PlaneIndex = 0; PlaneIndex < 5; ++PlaneIndex)
		{
			PassParameters->FrustumPlanes[PlaneIndex] = FVector4f(InViewDesc.Planes[PlaneIndex]); // LWC_TODO: precision loss
		}

		PassParameters->RWInstanceInfo = InVolatileResources.InstanceInfoBufferUAV;
		PassParameters->RWBaseInstanceBuffer = InVolatileResources.BaseInstanceBufferUAV;
		PassParameters->RWIndirectArgsBuffer = InVolatileResources.IndirectArgsBufferUAV;
		PassParameters->NumToAdd = NumToAdd;
		PassParameters->Seed = rand() % 10000000;
		PassParameters->InstanceBufferSize = InDesc.MaxRenderItems;

		FComputeShaderUtils::AddPass(
			GraphBuilder,
			RDG_EVENT_NAME("AddInstances"),
			ComputeShader, PassParameters, FIntVector(FMath::DivideAndRoundUp(NumToAdd, 64), 1, 1));
	}

	/** Initialise the draw indirect buffer. */
	void AddPass_InitInstanceBuffer(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FDrawInstanceBuffers& InOutputResources, int NumIndices)
	{
		TShaderMapRef<FInitInstanceBuffer_CS> ComputeShader(InGlobalShaderMap);

		FInitInstanceBuffer_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FInitInstanceBuffer_CS::FParameters>();
		PassParameters->NumIndices = NumIndices;
		PassParameters->RWIndirectArgsBuffer = InOutputResources.IndirectArgsBufferUAV;

 		FComputeShaderUtils::AddPass(
 			GraphBuilder,
 			RDG_EVENT_NAME("InitInstanceBuffer"),
 			ComputeShader, PassParameters, FIntVector(1, 1, 1));
	}

	/** Push instances away from ViewOrigin. */
	void AddPass_PushInstances(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FProxyDesc const& InDesc, FVolatileResources& InVolatileResources, FDrawInstanceBuffers& InOutputResources, FMainViewDesc const& InViewDesc)
	{
		FPushInstances_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FPushInstances_CS::FParameters>();
		PassParameters->IndirectArgsBuffer = InVolatileResources.IndirectArgsBuffer;
		PassParameters->IndirectArgsBufferSRV = InVolatileResources.IndirectArgsBufferSRV;
		PassParameters->RWBaseInstanceBuffer = InVolatileResources.BaseInstanceBufferUAV;
		PassParameters->RWIndirectArgsBuffer = InOutputResources.IndirectArgsBufferUAV;
		PassParameters->ViewOrigin = (FVector3f)FVector(InDesc.SceneProxy->GetLocalToWorld().Inverse().TransformPosition(InViewDesc.ViewOrigin));

		int32 IndirectArgOffset = ${NAME}Mesh::IndirectArgsByteOffset_FinalCull;

		FPushInstances_CS::FPermutationDomain PermutationVector;

		TShaderMapRef<FPushInstances_CS> ComputeShader(InGlobalShaderMap, PermutationVector);
		FComputeShaderUtils::AddPass(
			GraphBuilder,
			RDG_EVENT_NAME("PushInstances"),
			ComputeShader, PassParameters,
			InVolatileResources.IndirectArgsBuffer,
			IndirectArgOffset);
	}

	/** Cull instances and write to the final output buffer. */
	void AddPass_CullInstances(FRDGBuilder& GraphBuilder, FGlobalShaderMap* InGlobalShaderMap, FProxyDesc const& InDesc, FVolatileResources& InVolatileResources, FDrawInstanceBuffers& InOutputResources, FChildViewDesc const& InViewDesc)
	{
		FCullInstances_CS::FParameters* PassParameters = GraphBuilder.AllocParameters<FCullInstances_CS::FParameters>();
		PassParameters->MeshBuffer = InVolatileResources.MeshBufferSRV;
		PassParameters->IndirectArgsBuffer = InVolatileResources.IndirectArgsBuffer;
		PassParameters->IndirectArgsBufferSRV = InVolatileResources.IndirectArgsBufferSRV;
		PassParameters->BaseInstanceBuffer = InVolatileResources.BaseInstanceBufferSRV;
		PassParameters->RWInstanceBuffer = InOutputResources.InstanceBufferUAV;
		PassParameters->RWIndirectArgsBuffer = InOutputResources.IndirectArgsBufferUAV;

		for (int32 PlaneIndex = 0; PlaneIndex < 5; ++PlaneIndex)
		{
			PassParameters->FrustumPlanes[PlaneIndex] = FVector4f(InViewDesc.Planes[PlaneIndex]); // LWC_TODO: precision loss
		}

		int32 IndirectArgOffset = ${NAME}Mesh::IndirectArgsByteOffset_FinalCull;

		FCullInstances_CS::FPermutationDomain PermutationVector;

		TShaderMapRef<FCullInstances_CS> ComputeShader(InGlobalShaderMap, PermutationVector);
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
	SCOPE_CYCLE_COUNTER(STAT_${NAME}Mesh_SubmitWork);
	DECLARE_GPU_STAT(${NAME}Mesh)
	RDG_EVENT_SCOPE(GraphBuilder, "${NAME}");
	RDG_GPU_STAT_SCOPE(GraphBuilder, ${NAME}Mesh);

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
		int NumIndices = SceneProxies[WorkDesc.ProxyIndex]->RenderData->LODResources[0].IndexBuffer.GetNumIndices();
		AddPass_InitInstanceBuffer(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), Buffers[WorkDesc.BufferIndex], NumIndices);
	}

	// Iterate workloads and submit work
	const int32 NumWorkItems = WorkDescs.Num();
	int32 WorkIndex = 0;
	while (WorkIndex < NumWorkItems)
	{
		// Gather data per proxy
		F${NAME}SceneProxy const* Proxy = SceneProxies[WorkDescs[WorkIndex].ProxyIndex];

		${NAME}Mesh::FProxyDesc ProxyDesc;
		ProxyDesc.SceneProxy = Proxy;

		// 1 << CeilLogTwo takes a number and returns the next power of two. so: 53 -> 64, 80 -> 128, etc.
		ProxyDesc.MaxRenderItems = 1 << FMath::CeilLogTwo(MAX_INSTANCES);
		ProxyDesc.NumAddPassWavefronts = 16;

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

			const int32 MainViewNumPlanes = FMath::Min(MainViewData.ViewFrustum.Planes.Num(), 5);
			for (int32 PlaneIndex = 0; PlaneIndex < MainViewNumPlanes; ++PlaneIndex)
			{
				FPlane Plane = MainViewData.ViewFrustum.Planes[PlaneIndex];
				Plane = Plane.TransformBy(Proxy->GetLocalToWorld().Inverse());
				MainViewDesc.Planes[PlaneIndex] = FVector4(-Plane.X, -Plane.Y, -Plane.Z, Plane.W);
			}
			for (int32 PlaneIndex = MainViewNumPlanes; PlaneIndex < 5; ++PlaneIndex)
			{
				MainViewDesc.Planes[PlaneIndex] = FPlane(0, 0, 0, 1); // Null plane won't cull anything
			}

			// Build volatile graph resources
			${NAME}Mesh::FVolatileResources VolatileResources;
			${NAME}Mesh::InitializeResources(GraphBuilder, ProxyDesc, MainViewDesc, VolatileResources);

			// Build graph
			if (ProxyDesc.SceneProxy->AddInstancesNextFrame) {
				${NAME}Mesh::AddPass_AddInstances(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), ProxyDesc, VolatileResources, MainViewDesc);
				ProxyDesc.SceneProxy->AddInstancesNextFrame = false;
			}

			${NAME}Mesh::AddPass_InitBuffers(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), ProxyDesc, VolatileResources);

			${NAME}Mesh::AddPass_PushInstances(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), ProxyDesc, VolatileResources, Buffers[WorkDescs[WorkIndex].BufferIndex], MainViewDesc);

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
					
				const int32 ChildViewNumPlanes = FMath::Min(Frustum.Planes.Num(), 5);
				for (int32 PlaneIndex = 0; PlaneIndex < ChildViewNumPlanes; ++PlaneIndex)
				{
					FPlane Plane = Frustum.Planes[PlaneIndex];
					Plane = Plane.TransformBy(Proxy->GetLocalToWorld().Inverse());
					ChildViewDesc.Planes[PlaneIndex] = FVector4(-Plane.X, -Plane.Y, -Plane.Z, Plane.W);
				}
				for (int32 PlaneIndex = ChildViewNumPlanes; PlaneIndex < 5; ++PlaneIndex)
				{
					MainViewDesc.Planes[PlaneIndex] = FPlane(0, 0, 0, 1); // Null plane won't cull anything
				}

				// Build graph
				${NAME}Mesh::AddPass_CullInstances(GraphBuilder, GetGlobalShaderMap(GMaxRHIFeatureLevel), ProxyDesc, VolatileResources, Buffers[WorkDescs[WorkIndex].BufferIndex], ChildViewDesc);

				WorkIndex++;
			}
		}
	}

	// Add pass to transition all output buffers for reading
	AddPass_TransitionAllDrawBuffers(GraphBuilder, Buffers, UsedBufferIndices, false);
}
