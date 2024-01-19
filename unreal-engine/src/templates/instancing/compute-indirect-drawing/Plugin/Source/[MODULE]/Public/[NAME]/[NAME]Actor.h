// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "${NAME}Actor.generated.h"

UCLASS(hidecategories = (Cooking, Input, LOD), MinimalAPI)
class A${NAME} : public AActor
{
	GENERATED_UCLASS_BODY()

private:
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, meta = (AllowPrivateAccess = "true"))
	class U${NAME}Component* ${NAME}Component;

protected:
};
