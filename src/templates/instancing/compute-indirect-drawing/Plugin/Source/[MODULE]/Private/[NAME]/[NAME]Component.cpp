// Copyright Epic Games, Inc. All Rights Reserved.
// Adapted from the VirtualHeightfieldMesh plugin

#include "${MODULE_NAME}/Public/${NAME}/${NAME}Component.h"

#include "Engine/World.h"
#include "${NAME}SceneProxy.h"

U${NAME}Component::U${NAME}Component(const FObjectInitializer& ObjectInitializer)
	: Super(ObjectInitializer)
{
	CastShadow = true;
	bCastContactShadow = false;
	bUseAsOccluder = true;
	bAffectDynamicIndirectLighting = false;
	bAffectDistanceFieldLighting = false;
	bNeverDistanceCull = true;
#if WITH_EDITORONLY_DATA
	bEnableAutoLODGeneration = false;
#endif
	Mobility = EComponentMobility::Static;
}

void U${NAME}Component::OnRegister()
{
	Super::OnRegister();
}

void U${NAME}Component::OnUnregister()
{
	Super::OnUnregister();
}

void U${NAME}Component::ApplyWorldOffset(const FVector& InOffset, bool bWorldShift)
{
	Super::ApplyWorldOffset(InOffset, bWorldShift);
	MarkRenderStateDirty();
}

bool U${NAME}Component::IsVisible() const
{
	return Super::IsVisible();
}

FBoxSphereBounds U${NAME}Component::CalcBounds(const FTransform& LocalToWorld) const
{
	return FBoxSphereBounds(FBox(FVector(0.f, 0.f, 0.f), FVector(10000.f))).TransformBy(LocalToWorld);
}

FPrimitiveSceneProxy* U${NAME}Component::CreateSceneProxy()
{
	return new F${NAME}SceneProxy(this);
}

void U${NAME}Component::SetMaterial(int32 InElementIndex, UMaterialInterface* InMaterial)
{
	if (InElementIndex == 0 && Material != InMaterial)
	{
		Material = InMaterial;
		MarkRenderStateDirty();
	}
}

void U${NAME}Component::GetUsedMaterials(TArray<UMaterialInterface*>& OutMaterials, bool bGetDebugMaterials) const
{
	if (Material != nullptr)
	{
		OutMaterials.Add(Material);
	}
}