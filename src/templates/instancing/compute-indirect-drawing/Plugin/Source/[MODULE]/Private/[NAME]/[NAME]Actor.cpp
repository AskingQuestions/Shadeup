// Copyright Epic Games, Inc. All Rights Reserved.

#include "${MODULE_NAME}/Public/${NAME}/${NAME}Actor.h"
#include "${MODULE_NAME}/Public/${NAME}/${NAME}Component.h"

A${NAME}::A${NAME}(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
	RootComponent = ${NAME}Component = CreateDefaultSubobject<U${NAME}Component>(TEXT("${NAME}Component"));
}
