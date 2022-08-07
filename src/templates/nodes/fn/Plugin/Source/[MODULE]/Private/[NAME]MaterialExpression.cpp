// Copyright Epic Games, Inc. All Rights Reserved.

#include "${MODULE_NAME}/Public/${NAME}MaterialExpression.h"

#include "MaterialCompiler.h"

// Used by the LOCTEXT() macro. See: https://docs.unrealengine.com/5.0/en-US/text-localization-in-unreal-engine/
#define LOCTEXT_NAMESPACE "MaterialExpression"

UMaterialExpression${NAME}::UMaterialExpression${NAME}(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
	// Structure to hold one-time initialization
	struct FConstructorStatics
	{
		FText NAME_Functions;
		// This is used for placing the expression in the correct category
		// You can reference multiple categories here, see: https://github.com/EpicGames/UnrealEngine/blob/ue5-main/Engine/Source/Runtime/Engine/Private/Materials/MaterialExpressions.cpp#L18670
		FConstructorStatics()
			: NAME_Functions(LOCTEXT( "Functions", "Functions" )) // These can be anything. Like: NAME_Math(LOCTEXT( "Math", "Math" ))
		{
		}
	};
	static FConstructorStatics ConstructorStatics;

#if WITH_EDITORONLY_DATA
	MenuCategories.Add(ConstructorStatics.NAME_Functions);
#endif
}

#if WITH_EDITOR
int32 UMaterialExpression${NAME}::Compile( FMaterialCompiler* Compiler, int32 OutputIndex)
{
	int32 Result=INDEX_NONE;

	// Check if the input is hooked up, Input is a member we defined in the header for this material expresion.
	// Note: You can define more than one input.

	if( !Input.GetTracedInput().Expression )
	{
		// an input expression must exist
		Result = Compiler->Errorf( TEXT("Missing ${NAME} input") );
	}
	else
	{
		// We get references to inputs/expressions in the form of an int32.
		// These can be passed around and operated on using the FMaterialCompiler::* functions.
		// A list of available functions can be found here: https://docs.unrealengine.com/5.0/en-US/API/Runtime/Engine/FMaterialCompiler/

		// First we store a reference to the input expression.
		int32 InputValue = Input.Compile(Compiler);

		// Then cast to a float3 to ensure the input is a vector.
		int32 InputVector = Compiler->ForceCast(InputValue, MCT_Float3);

		// Then get the length^2 of the vector.
		int32 DotResult = Compiler->Dot(InputVector, InputVector);

		// Then sqrt the result.
		int32 RootResult = Compiler->SquareRoot(DotResult);

		// Finally, we return the result.
		Result = RootResult;
	}

	return Result;
}

void UMaterialExpression${NAME}::GetCaption(TArray<FString>& OutCaptions) const
{
	OutCaptions.Add(TEXT("Shadeup Material Function"));
}
#endif // WITH_EDITOR

#undef LOCTEXT_NAMESPACE