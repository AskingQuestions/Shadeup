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
BEGIN_GLOBAL_SHADER_PARAMETER_STRUCT(${NAME}Parameters, )
	// SHADER_PARAMETER_TEXTURE(Texture2D<uint4>, PageTableTexture)
END_GLOBAL_SHADER_PARAMETER_STRUCT()

typedef TUniformBufferRef<${NAME}Parameters> ${NAME}BufferRef;

/**
 * Per frame UserData to pass to the vertex shader.
 */
struct ${NAME}UserData : public FOneFrameResource
{
	// FRHIShaderResourceView* InstanceBufferSRV;
	FVector3f LodViewOrigin;
};

/*
* Index buffer to provide incides for the mesh we're rending.
*/
class ${NAME}IndexBuffer : public FIndexBuffer
{
public:

	${NAME}IndexBuffer()
	{}

	virtual void InitRHI() override;

	int32 GetIndexCount() const { return NumIndices; }

private:
	int32 NumIndices = 0;
};

class ${NAME} : public FVertexFactory
{
	DECLARE_VERTEX_FACTORY_TYPE(${NAME});

public:
	${NAME}(ERHIFeatureLevel::Type InFeatureLevel, const ${NAME}Parameters& InParams);

	~${NAME}();

	virtual void InitRHI() override;
	virtual void ReleaseRHI() override;

	static bool ShouldCompilePermutation(const FVertexFactoryShaderPermutationParameters& Parameters);
	static void ModifyCompilationEnvironment(const FVertexFactoryShaderPermutationParameters& Parameters, FShaderCompilerEnvironment& OutEnvironment);
	static void ValidateCompiledResult(const FVertexFactoryType* Type, EShaderPlatform Platform, const FShaderParameterMap& ParameterMap, TArray<FString>& OutErrors);

	FIndexBuffer const* GetIndexBuffer() const { return IndexBuffer; }

private:
	${NAME}Parameters Params;
	${NAME}BufferRef UniformBuffer;
	${NAME}IndexBuffer* IndexBuffer = nullptr;

	// Shader parameters is the data passed to our vertex shader
	friend class ${NAME}ShaderParameters;
};
