// Copyright Epic Games, Inc. All Rights Reserved.
// Adapted from the VirtualHeightfieldMesh plugin

#pragma once

#include "CoreMinimal.h"
#include "${NAME}VertexFactory.h"
#include "PrimitiveUniformShaderParametersBuilder.h"
#include "Materials/MaterialRenderProxy.h"
#include "PrimitiveSceneProxy.h"

namespace ${NAME}Mesh
{
	/** Buffers filled by GPU culling. */
	struct FDrawInstanceBuffers
	{
		/* Culled instance buffer. */
		FBufferRHIRef InstanceBuffer;
		FUnorderedAccessViewRHIRef InstanceBufferUAV;
		FShaderResourceViewRHIRef InstanceBufferSRV;

		/* IndirectArgs buffer for final DrawInstancedIndirect. */
		FBufferRHIRef IndirectArgsBuffer;
		FUnorderedAccessViewRHIRef IndirectArgsBufferUAV;
	};
}

class F${NAME}SceneProxy final : public FPrimitiveSceneProxy
{
public:
	F${NAME}SceneProxy(class U${NAME}Component * InComponent);

protected:
	//~ Begin FPrimitiveSceneProxy Interface
	virtual SIZE_T GetTypeHash() const override;
	virtual uint32 GetMemoryFootprint() const override;
	virtual void CreateRenderThreadResources() override;
	virtual void DestroyRenderThreadResources() override;
	virtual void OnTransformChanged() override;
	virtual FPrimitiveViewRelevance GetViewRelevance(const FSceneView *View) const override;
	virtual void GetDynamicMeshElements(const TArray<const FSceneView *> &Views, const FSceneViewFamily &ViewFamily, uint32 VisibilityMap, FMeshElementCollector &Collector) const override;
	//~ End FPrimitiveSceneProxy Interface

	F${NAME}MeshUniformBufferRef CreateVFUniformBuffer() const;

private:
	void BuildOcclusionVolumes(TArrayView<FVector2D> const &InMinMaxData, FIntPoint const &InMinMaxSize, TArrayView<int32> const &InMinMaxMips, int32 InNumLods);

public:
	bool bIsMeshValid;

	mutable std::atomic<bool> AddInstancesNextFrame;

	class FMaterialRenderProxy *Material;
	class UStaticMesh *LocalStaticMesh;
	FStaticMeshRenderData *RenderData;
	FMaterialRelevance MaterialRelevance;

	int LODIndex;

	mutable TUniformBuffer<FPrimitiveUniformShaderParameters> UniformBufferStore;
	mutable FStaticMeshDataType StaticMeshData;
	mutable F${NAME}MeshUniformBufferRef VertexFactoryUniformBuffer;

	// Multi-frame buffers used to store the instance data.
	// This is initialized in RenderExtension::InitializeResources()
	mutable TRefCountPtr<FRDGPooledBuffer> BaseInstanceBuffer;
	mutable TRefCountPtr<FRDGPooledBuffer> InstanceInfoBuffer;

	bool bCallbackRegistered;

	class F${NAME}MeshVertexFactory *VertexFactory;
};

//  Notes: Looks like GetMeshShaderMap is returning nullptr during the DepthPass