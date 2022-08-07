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

UCLASS(MinimalAPI, collapsecategories, hidecategories=Object)
class UMaterialExpression${NAME} : public UMaterialExpressionCustomOutput
{
	GENERATED_UCLASS_BODY()

	/** Input pin */
	UPROPERTY(meta = (RequiredInput = "false", ToolTip = "Here's the tooltip text."))
	FExpressionInput MyInput1;

	/** Input pin */
	UPROPERTY(meta = (RequiredInput = "false", ToolTip = "Here's the tooltip text."))
	FExpressionInput MyInput2;

	/** This is available in the material editor when selecting this node */
	UPROPERTY(EditAnywhere, Category = "MyCategory")
	float CustomEditorParameter;

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
	//~ End UMaterialExpressionCustomOutput Interface
};



