// Copyright Epic Games, Inc. All Rights Reserved.
// Adapted from the VirtualHeightfieldMesh plugin

#pragma once

#include "CoreMinimal.h"
#include "Containers/DynamicRHIResourceArray.h"
#include "RenderResource.h"
#include "RHI.h"
#include "SceneManagement.h"
#include "UniformBuffer.h"
#include "VertexFactory.h"

/**
 * Uniform buffer to hold parameters specific to this vertex factory. Only set up once.
 */
BEGIN_GLOBAL_SHADER_PARAMETER_STRUCT(F${NAME}Parameters, )
	// SHADER_PARAMETER_TEXTURE(Texture2D<uint4>, PageTableTexture)
END_GLOBAL_SHADER_PARAMETER_STRUCT()

typedef TUniformBufferRef<F${NAME}Parameters> F${NAME}BufferRef;

/**
 * Per frame UserData to pass to the vertex shader.
 */
struct F${NAME}UserData : public FOneFrameResource
{
	FRHIShaderResourceView* InstanceBufferSRV;
	FVector3f LodViewOrigin;
};

/*
* Index buffer to provide incides for the mesh we're rending.
*/
class F${NAME}IndexBuffer : public FIndexBuffer
{
public:

	F${NAME}IndexBuffer()
	{}

	virtual void InitRHI() override;

	int32 GetIndexCount() const { return NumIndices; }

private:
	int32 NumIndices = 0;
};

class F${NAME}VertexFactory : public FVertexFactory
{
	DECLARE_VERTEX_FACTORY_TYPE(F${NAME});

public:
	F${NAME}VertexFactory(ERHIFeatureLevel::Type InFeatureLevel, const F${NAME}Parameters& InParams);

	~F${NAME}VertexFactory();

	virtual void InitRHI() override;
	virtual void ReleaseRHI() override;

	static bool ShouldCompilePermutation(const FVertexFactoryShaderPermutationParameters& Parameters);
	static void ModifyCompilationEnvironment(const FVertexFactoryShaderPermutationParameters& Parameters, FShaderCompilerEnvironment& OutEnvironment);
	static void ValidateCompiledResult(const FVertexFactoryType* Type, EShaderPlatform Platform, const FShaderParameterMap& ParameterMap, TArray<FString>& OutErrors);

	FIndexBuffer const* GetIndexBuffer() const { return IndexBuffer; }

private:
	F${NAME}Parameters Params;
	F${NAME}BufferRef UniformBuffer;
	F${NAME}IndexBuffer* IndexBuffer = nullptr;

	// Shader parameters is the data passed to our vertex shader
	friend class F${NAME}ShaderParameters;
};
