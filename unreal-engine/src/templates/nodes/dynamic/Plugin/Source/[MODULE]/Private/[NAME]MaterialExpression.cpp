// Copyright Epic Games, Inc. All Rights Reserved.

#include "${MODULE_NAME}/Public/${NAME}MaterialExpression.h"

#include "Materials/MaterialExpressionCustom.h"
#include "MaterialCompiler.h"
#include "MaterialGraph/MaterialGraphNode.h"

// Used by the LOCTEXT() macro. See: https://docs.unrealengine.com/5.0/en-US/text-localization-in-unreal-engine/
#define LOCTEXT_NAMESPACE "MaterialExpression"

UMaterialExpression${NAME}::UMaterialExpression${NAME}(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
	// Structure to hold one-time initialization
	struct FConstructorStatics
	{
		FText NAME_Output;
		// This is used for placing the expression in the correct category
		// You can reference multiple categories here, see: https://github.com/EpicGames/UnrealEngine/blob/ue5-main/Engine/Source/Runtime/Engine/Private/Materials/MaterialExpressions.cpp#L18670
		FConstructorStatics()
			: NAME_Output(LOCTEXT( "Output", "Output" )) // These can be anything. Like: NAME_Math(LOCTEXT( "Math", "Math" ))
		{
		}
	};
	static FConstructorStatics ConstructorStatics;

	OutputTargetsRequired = {
		FMaterialExpression${NAME}Input {
			"Required Default Output",
			1
		}
	};

#if WITH_EDITORONLY_DATA
	MenuCategories.Add(ConstructorStatics.NAME_Output);
#endif

#if WITH_EDITOR
	Outputs.Reset(); // Remove the default output pin
#endif
}

#if WITH_EDITOR

int32 UMaterialExpression${NAME}::Compile(class FMaterialCompiler* Compiler, int32 OutputIndex)
{
	if (OutputTargetsRequired.IsValidIndex(OutputIndex))
	{
		if (OutputTargetsRequired[OutputIndex].Input.Expression)
		{
			int32 CodeInput = OutputTargetsRequired[OutputIndex].Input.IsConnected() ? OutputTargetsRequired[OutputIndex].Input.Compile(Compiler) : Compiler->Constant(0.f);
			return Compiler->CustomOutput(this, OutputIndex, CodeInput);
		}
	}
	
	if (OutputTargets.IsValidIndex(OutputIndex - OutputTargetsRequired.Num()))
	{
		if (OutputTargets[OutputIndex - OutputTargetsRequired.Num()].Input.Expression)
		{
			int32 CodeInput = OutputTargets[OutputIndex - OutputTargetsRequired.Num()].Input.IsConnected() ? OutputTargets[OutputIndex - 1].Input.Compile(Compiler) : Compiler->Constant(0.f);
			return Compiler->CustomOutput(this, OutputIndex, CodeInput);
		}
	}

	return INDEX_NONE;
}

void UMaterialExpression${NAME}::GetCaption(TArray<FString>& OutCaptions) const
{
	OutCaptions.Add(FString(TEXT("Dynamic Output")));
}

#endif // WITH_EDITOR

int32 UMaterialExpression${NAME}::GetNumOutputs() const
{
	return OutputTargets.Num() + OutputTargetsRequired.Num();
}

FString UMaterialExpression${NAME}::GetFunctionName() const
{
	return TEXT("GetShadeupDynamicMaterialOutput");
}

FString UMaterialExpression${NAME}::GetDisplayName() const
{
	return TEXT("Shadeup Dynamic Ouput");
}

FName UMaterialExpression${NAME}::GetInputName(int32 InputIndex) const
{
	if (InputIndex < OutputTargetsRequired.Num())
	{
		return FName(OutputTargetsRequired[InputIndex].Name);
	}else
	{
		return FName(OutputTargets[InputIndex - OutputTargetsRequired.Num()].Name);
	}
}

const TArray<FExpressionInput*> UMaterialExpression${NAME}::GetInputs()
{
	TArray<FExpressionInput*> OutInputs;
	for (auto& Input : OutputTargetsRequired)
	{
		OutInputs.Add(&Input.Input);
	}
	for (auto& Input : OutputTargets)
	{
		OutInputs.Add(&Input.Input);
	}
	return OutInputs;
}

FExpressionInput* UMaterialExpression${NAME}::GetInput(int32 InputIndex)
{
	if (InputIndex < OutputTargetsRequired.Num())
	{
		return &OutputTargetsRequired[InputIndex].Input;
	}else
	{
		return &OutputTargets[InputIndex - OutputTargetsRequired.Num()].Input;
	}
}

void UMaterialExpression${NAME}::PostEditChangeProperty(FPropertyChangedEvent& PropertyChangedEvent)
{
	Super::PostEditChangeProperty(PropertyChangedEvent);

	if (PropertyChangedEvent.MemberProperty)
	{
		const FName PropertyName = PropertyChangedEvent.MemberProperty->GetFName();
		if (PropertyName == GET_MEMBER_NAME_CHECKED(UMaterialExpression${NAME}, OutputTargets))
		{
			if (UMaterialGraphNode* MatGraphNode = Cast<UMaterialGraphNode>(GraphNode))
			{
				MatGraphNode->RecreateAndLinkNode();
			}
		}
	}
}

#undef LOCTEXT_NAMESPACE