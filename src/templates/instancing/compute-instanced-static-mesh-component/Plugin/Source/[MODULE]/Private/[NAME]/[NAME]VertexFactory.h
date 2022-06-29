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
 * Common shader parameters for mesh particle renderers (used by multiple shaders)
 */
BEGIN_SHADER_PARAMETER_STRUCT(F${NAME}MeshCommonParameters, ${NAME}VERTEXFACTORIES_API)
	SHADER_PARAMETER_SRV(Buffer<float>, ${NAME}ParticleDataFloat)
	SHADER_PARAMETER_SRV(Buffer<float>, ${NAME}ParticleDataHalf)
	SHADER_PARAMETER_SRV(Buffer<int>, ${NAME}ParticleDataInt)
	SHADER_PARAMETER(uint32, ${NAME}FloatDataStride)
	SHADER_PARAMETER(uint32, ${NAME}IntDataStride)

	SHADER_PARAMETER_SRV(Buffer<int>, SortedIndices)
	SHADER_PARAMETER(int, SortedIndicesOffset)
	
	SHADER_PARAMETER(FVector3f, SystemLWCTile)
	SHADER_PARAMETER(int, bLocalSpace)
	SHADER_PARAMETER(float, DeltaSeconds)
	SHADER_PARAMETER(uint32, FacingMode)

	SHADER_PARAMETER(FVector3f, MeshScale)
	SHADER_PARAMETER(FVector3f, MeshOffset)
	SHADER_PARAMETER(FVector4f, MeshRotation)
	SHADER_PARAMETER(int, bMeshOffsetIsWorldSpace)

	SHADER_PARAMETER(uint32, bLockedAxisEnable)
	SHADER_PARAMETER(FVector3f, LockedAxis)
	SHADER_PARAMETER(uint32, LockedAxisSpace)
	
	SHADER_PARAMETER(int, ScaleDataOffset)
	SHADER_PARAMETER(int, RotationDataOffset)
	SHADER_PARAMETER(int, PositionDataOffset)
	SHADER_PARAMETER(int, VelocityDataOffset)
	SHADER_PARAMETER(int, CameraOffsetDataOffset)
	SHADER_PARAMETER(int, PrevScaleDataOffset)
	SHADER_PARAMETER(int, PrevRotationDataOffset)
	SHADER_PARAMETER(int, PrevPositionDataOffset)
	SHADER_PARAMETER(int, PrevVelocityDataOffset)
	SHADER_PARAMETER(int, PrevCameraOffsetDataOffset)

	SHADER_PARAMETER(FVector3f, DefaultScale)
	SHADER_PARAMETER(FVector4f, DefaultRotation)
	SHADER_PARAMETER(FVector3f, DefaultPosition)
	SHADER_PARAMETER(FVector3f, DefaultVelocity)
	SHADER_PARAMETER(float, DefaultCameraOffset)
	SHADER_PARAMETER(FVector3f, DefaultPrevScale)
	SHADER_PARAMETER(FVector4f, DefaultPrevRotation)
	SHADER_PARAMETER(FVector3f, DefaultPrevPosition)
	SHADER_PARAMETER(FVector3f, DefaultPrevVelocity)
	SHADER_PARAMETER(float, DefaultPrevCameraOffset)
END_SHADER_PARAMETER_STRUCT()

/**
* Uniform buffer for mesh particle vertex factories.
*/
BEGIN_GLOBAL_SHADER_PARAMETER_STRUCT(F${NAME}MeshUniformParameters, ${NAME}VERTEXFACTORIES_API)
	SHADER_PARAMETER_STRUCT_INCLUDE(F${NAME}MeshCommonParameters, Common)

	SHADER_PARAMETER_SRV(Buffer<float2>, VertexFetch_TexCoordBuffer)
	SHADER_PARAMETER_SRV(Buffer<float4>, VertexFetch_PackedTangentsBuffer)
	SHADER_PARAMETER_SRV(Buffer<float4>, VertexFetch_ColorComponentsBuffer)
	SHADER_PARAMETER(FIntVector4, VertexFetch_Parameters)

	SHADER_PARAMETER(FVector4f, SubImageSize)
	SHADER_PARAMETER(uint32, TexCoordWeightA)
	SHADER_PARAMETER(uint32, TexCoordWeightB)
	SHADER_PARAMETER(uint32, MaterialParamValidMask)

	SHADER_PARAMETER(int, NormalizedAgeDataOffset)
	SHADER_PARAMETER(int, SubImageDataOffset)
	SHADER_PARAMETER(int, MaterialRandomDataOffset)
	SHADER_PARAMETER(int, ColorDataOffset)
	SHADER_PARAMETER(int, MaterialParamDataOffset)
	SHADER_PARAMETER(int, MaterialParam1DataOffset)
	SHADER_PARAMETER(int, MaterialParam2DataOffset)
	SHADER_PARAMETER(int, MaterialParam3DataOffset)

	SHADER_PARAMETER(float, DefaultNormAge)
	SHADER_PARAMETER(float, DefaultSubImage)
	SHADER_PARAMETER(float, DefaultMatRandom)
	SHADER_PARAMETER(FVector4f, DefaultColor)
	SHADER_PARAMETER(FVector4f, DefaultDynamicMaterialParameter0)
	SHADER_PARAMETER(FVector4f, DefaultDynamicMaterialParameter1)
	SHADER_PARAMETER(FVector4f, DefaultDynamicMaterialParameter2)
	SHADER_PARAMETER(FVector4f, DefaultDynamicMaterialParameter3)

	SHADER_PARAMETER(int, SubImageBlendMode)
END_GLOBAL_SHADER_PARAMETER_STRUCT()

typedef TUniformBufferRef<F${NAME}MeshUniformParameters> F${NAME}MeshUniformBufferRef;

class F${NAME}MeshInstanceVertices;


/**
* Vertex factory for rendering instanced mesh particles with out dynamic parameter support.
*/
class ${NAME}VERTEXFACTORIES_API F${NAME}MeshVertexFactory : public FVertexFactory
{
	DECLARE_VERTEX_FACTORY_TYPE(F${NAME}MeshVertexFactory);
public:
	
	/** Default constructor. */
	F${NAME}MeshVertexFactory(E${NAME}VertexFactoryType InType, ERHIFeatureLevel::Type InFeatureLevel)
		: FVertexFactory(InFeatureLevel)
		, MeshIndex(-1)
		, LODIndex(-1)
		, bAddPrimitiveIDElement(true)
		, InstanceVerticesCPU(nullptr)
		, FloatDataStride(0)
	{}

	F${NAME}MeshVertexFactory()
		: FVertexFactory(ERHIFeatureLevel::Num)
		, MeshIndex(-1)
		, LODIndex(-1)
		, bAddPrimitiveIDElement(true)
		, InstanceVerticesCPU(nullptr)
		, FloatDataStride(0)
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
	FORCEINLINE void SetUniformBuffer(const F${NAME}MeshUniformBufferRef& InMeshParticleUniformBuffer)
	{
		MeshParticleUniformBuffer = InMeshParticleUniformBuffer;
	}

	/**
	* Retrieve the uniform buffer for this vertex factory.
	*/
	FORCEINLINE FRHIUniformBuffer* GetUniformBuffer() const
	{
		return MeshParticleUniformBuffer;
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
	
protected:
	FStaticMeshDataType Data;
	int32 MeshIndex;	
	int32 LODIndex;
	bool bAddPrimitiveIDElement;

	/** Uniform buffer with mesh particle parameters. */
	FRHIUniformBuffer* MeshParticleUniformBuffer;
	
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
