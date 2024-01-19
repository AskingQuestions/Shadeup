// Copyright Epic Games, Inc. All Rights Reserved.

#include "${MODULE_NAME}/Public/${NAME}MaterialExpression.h"

#include "Materials/MaterialExpressionCustom.h"

#include "MaterialCompiler.h"

// Used by the LOCTEXT() macro. See: https://docs.unrealengine.com/5.0/en-US/text-localization-in-unreal-engine/
#define LOCTEXT_NAMESPACE "MaterialExpression"

UMaterialExpression${NAME}::UMaterialExpression${NAME}(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
	// Structure to hold one-time initialization
	struct FConstructorStatics
	{
		FText NAME_Input;
		// This is used for placing the expression in the correct category
		// You can reference multiple categories here, see: https://github.com/EpicGames/UnrealEngine/blob/ue5-main/Engine/Source/Runtime/Engine/Private/Materials/MaterialExpressions.cpp#L18670
		FConstructorStatics()
			: NAME_Input(LOCTEXT( "Input", "Input" )) // These can be anything. Like: NAME_Math(LOCTEXT( "Math", "Math" ))
		{
		}
	};
	static FConstructorStatics ConstructorStatics;

#if WITH_EDITORONLY_DATA
	MenuCategories.Add(ConstructorStatics.NAME_Input);
#endif

#if WITH_EDITORONLY_DATA
	bShowOutputNameOnPin = true;

	Outputs.Reset();
	Outputs.Add(FExpressionOutput(TEXT("Output 1"), 1, 1, 0, 0, 0));
	Outputs.Add(FExpressionOutput(TEXT("Output 2"), 1, 0, 1, 0, 0));
#endif
}

#if WITH_EDITOR
int32 UMaterialExpression${NAME}::Compile( FMaterialCompiler* Compiler, int32 OutputIndex)
{
	// We return a reference to an expression for the current OutputIndex in the form of an int32.
	// These can be created by and operated on using the FMaterialCompiler::* functions.
	// A list of available functions can be found here: https://docs.unrealengine.com/5.0/en-US/API/Runtime/Engine/FMaterialCompiler/

	if (OutputIndex == 0)
	{
		return Compiler->Constant(1234);
	}
	else if (OutputIndex == 1)
	{
		// We can write custom HLSL code using the CustomExpression below.
		UMaterialExpressionCustom* CustomExpression = NewObject<UMaterialExpressionCustom>(this); // We're using this UObject once and letting the garbage collector clean it up

		CustomExpression->Code = TEXT("return 1234;");

		// You could also call to some custom code inside of a compute shader or vertex factory to access resources there.
		// CustomExpression->Code = TEXT("return GetMyCustomDataFromComputeShader(Parameters);"); // "Parameters" here refers to the "global" unreal material parameters struct, you can use this to get context (like position).

		int32 ReturnValue = CustomExpression->Compile(Compiler, 0);

		return ReturnValue;
	}

	return Compiler->Errorf(TEXT("Invalid input parameter"));
}

void UMaterialExpression${NAME}::GetCaption(TArray<FString>& OutCaptions) const
{
	OutCaptions.Add(TEXT("Shadeup Custom Inputs Node"));
}
#endif // WITH_EDITOR

#undef LOCTEXT_NAMESPACE