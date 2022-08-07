// Copyright Epic Games, Inc. All Rights Reserved.

/**
 * Absolute value material expression for user-defined materials
 *
 */

#pragma once

#include "CoreMinimal.h"
#include "UObject/ObjectMacros.h"
#include "MaterialExpressionIO.h"
#include "Materials/MaterialExpressionCustomOutput.h"
#include "${NAME}MaterialExpression.generated.h"

USTRUCT()
struct FMaterialExpression${NAME}Input
{
	GENERATED_BODY()

	// Name of the target
	UPROPERTY(EditAnywhere)
	FString Name;
	
	// Number of components to output (float1, float2, float3, float4)
	UPROPERTY(EditAnywhere)
	uint32 NumComponents = 1;

	UPROPERTY(meta = (RequiredInput = "true"))
	FExpressionInput Input;
};

UCLASS(MinimalAPI, collapsecategories, hidecategories=Object)
class UMaterialExpression${NAME} : public UMaterialExpressionCustomOutput
{
	GENERATED_UCLASS_BODY()

	UPROPERTY()
	TArray<FMaterialExpression${NAME}Input> OutputTargetsRequired;
	
	UPROPERTY(EditAnywhere)
	TArray<FMaterialExpression${NAME}Input> OutputTargets;

	//~ Begin UMaterialExpression Interface
#if WITH_EDITOR
	virtual int32 Compile(class FMaterialCompiler* Compiler, int32 OutputIndex) override;
	virtual void GetCaption(TArray<FString>& OutCaptions) const override;
#endif
	//~ End UMaterialExpression Interface

	//~ Begin UMaterialExpressionCustomOutput Interface
	virtual int32 GetNumOutputs() const override;
	virtual FString GetFunctionName() const override;
	virtual FString GetDisplayName() const override;
	virtual FName GetInputName(int32 InputIndex) const override;
	virtual const TArray<FExpressionInput*> GetInputs() override;
	virtual FExpressionInput* GetInput(int32 InputIndex) override;
	virtual void PostEditChangeProperty(FPropertyChangedEvent& PropertyChangedEvent) override;
	virtual uint32 GetInputType(int32 InputIndex) override
	{
		if (InputIndex < 1)
		{
			return OutputTargetsRequired[InputIndex].NumComponents;
		}else
		{
			return OutputTargets[InputIndex - 1].NumComponents;
		}
	}
	//~ End UMaterialExpressionCustomOutput Interface
};



