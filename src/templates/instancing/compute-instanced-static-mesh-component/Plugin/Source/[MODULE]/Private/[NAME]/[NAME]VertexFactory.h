// Copyright Epic Games, Inc. All Rights Reserved.

/*=============================================================================
ParticleVertexFactory.h: Particle vertex factory definitions.
=============================================================================*/

#pragma once

#include "CoreMinimal.h"
#include "RenderResource.h"
#include "UniformBuffer.h"
#include "SceneView.h"
#include "Components.h"
#include "SceneManagement.h"
#include "VertexFactory.h"

// Disable this define to test disabling the use of GPU Scene with ${NAME} mesh renderer
// NOTE: Changing this will also require you to make a trivial change to the mesh factory shader, or it may use cached shaders
#define ${NAME}_ENABLE_GPU_SCENE_MESHES 1

class FMaterial;
class FVertexBuffer;
struct FDynamicReadBuffer;
struct FShaderCompilerEnvironment;

/**
 * Per frame UserData to pass to the vertex shader.
 */
struct F${NAME}UserData : public FOneFrameResource
{
	FRHIShaderResourceView* InstanceBufferSRV;
};

/**
* Uniform buffer for mesh instance vertex factories.
*/
BEGIN_GLOBAL_SHADER_PARAMETER_STRUCT(F${NAME}MeshUniformParameters, ${SCOPE})

	SHADER_PARAMETER_SRV(Buffer<float2>, VertexFetch_TexCoordBuffer)
	SHADER_PARAMETER_SRV(Buffer<float4>, VertexFetch_PackedTangentsBuffer)
	SHADER_PARAMETER_SRV(Buffer<float4>, VertexFetch_ColorComponentsBuffer)
	SHADER_PARAMETER(FIntVector4, VertexFetch_Parameters)

END_GLOBAL_SHADER_PARAMETER_STRUCT()

typedef TUniformBufferRef<F${NAME}MeshUniformParameters> F${NAME}MeshUniformBufferRef;

class F${NAME}MeshInstanceVertices;


/**
* Vertex factory for rendering instanced mesh particles with out dynamic parameter support.
*/
class ${SCOPE} F${NAME}MeshVertexFactory : public FVertexFactory
{
	DECLARE_VERTEX_FACTORY_TYPE(F${NAME}MeshVertexFactory);
public:
	
	/** Default constructor. */
	F${NAME}MeshVertexFactory(ERHIFeatureLevel::Type InFeatureLevel)
		: FVertexFactory(InFeatureLevel)
		, MeshIndex(-1)
		, LODIndex(-1)
		, bAddPrimitiveIDElement(true)
		, InstanceVerticesCPU(nullptr)
	{}

	F${NAME}MeshVertexFactory()
		: FVertexFactory(ERHIFeatureLevel::Num)
		, MeshIndex(-1)
		, LODIndex(-1)
		, bAddPrimitiveIDElement(true)
		, InstanceVerticesCPU(nullptr)
	{}

	ERHIFeatureLevel::Type GetFeatureLevel() const { check(HasValidFeatureLevel());  return FRenderResource::GetFeatureLevel(); }

	/**
	* Should we cache the material's shadertype on this platform with this vertex factory?
	*/
	static bool ShouldCompilePermutation(const FVertexFactoryShaderPermutationParameters& Parameters);


	/**
	* Modify compile environment to enable instancing
	* @param OutEnvironment - shader compile environment to modify
	*/
	static void ModifyCompilationEnvironment(const FVertexFactoryShaderPermutationParameters& Parameters, FShaderCompilerEnvironment& OutEnvironment);


	/**
	* An implementation of the interface used by TSynchronizedResource to update the resource with new data from the game thread.
	*/
	void SetData(const FStaticMeshDataType& InData);

	/**
	* Set the uniform buffer for this vertex factory.
	*/
	FORCEINLINE void SetUniformBuffer(const F${NAME}MeshUniformBufferRef& InMeshInstanceUniformBuffer)
	{
		MeshInstanceUniformBuffer = InMeshInstanceUniformBuffer;
	}

	/**
	* Retrieve the uniform buffer for this vertex factory.
	*/
	FORCEINLINE FRHIUniformBuffer* GetUniformBuffer() const
	{
		return MeshInstanceUniformBuffer;
	}

	FORCEINLINE FRHIShaderResourceView* GetTangentsSRV() const
	{
		return Data.TangentsSRV;
	}

	FORCEINLINE FRHIShaderResourceView* GetTextureCoordinatesSRV() const
	{
		return Data.TextureCoordinatesSRV;
	}

	FORCEINLINE FRHIShaderResourceView* GetColorComponentsSRV() const
	{
		return Data.ColorComponentsSRV;
	}

	FORCEINLINE uint32 GetColorIndexMask() const
	{
		return Data.ColorIndexMask;
	}

	FORCEINLINE int GetNumTexcoords() const
	{
		return Data.NumTexCoords;
	}

	// FRenderResource interface.
	virtual void InitRHI() override;

	int32 GetMeshIndex() const { return MeshIndex; }
	void SetMeshIndex(int32 InMeshIndex) { MeshIndex = InMeshIndex; }

	int32 GetLODIndex() const { return LODIndex; }
	void SetLODIndex(int32 InLODIndex) { LODIndex = InLODIndex; }

	bool IsPrimitiveIDElementEnabled() const { return bAddPrimitiveIDElement; }
	void EnablePrimitiveIDElement(bool bEnable) { bAddPrimitiveIDElement = bEnable; }

	void SetupMeshData(const FStaticMeshLODResources& LODResources);
	
protected:
	FStaticMeshDataType Data;
	int32 MeshIndex;	
	int32 LODIndex;
	bool bAddPrimitiveIDElement;

	/** Uniform buffer with mesh particle parameters. */
	FRHIUniformBuffer* MeshInstanceUniformBuffer;
	
	/** Used to remember this in the case that we reuse the same vertex factory for multiple renders . */
	F${NAME}MeshInstanceVertices* InstanceVerticesCPU;
};

/**
* Base class for ${NAME} vertex factory shader parameters.
*/
class F${NAME}VertexFactoryShaderParametersBase : public FVertexFactoryShaderParameters
{
	DECLARE_TYPE_LAYOUT(F${NAME}VertexFactoryShaderParametersBase, NonVirtual);

public:
	void Bind(const FShaderParameterMap& ParameterMap);
	void GetElementShaderBindings(
		const FSceneInterface* Scene,
		const FSceneView* View,
		const FMeshMaterialShader* Shader,
		const EVertexInputStreamType VertexStreamType,
		ERHIFeatureLevel::Type FeatureLevel,
		const FVertexFactory* VertexFactory,
		const FMeshBatchElement& BatchElement,
		class FMeshDrawSingleShaderBindings& ShaderBindings,
		FVertexInputStreamArray& VertexStreams) const;
};
