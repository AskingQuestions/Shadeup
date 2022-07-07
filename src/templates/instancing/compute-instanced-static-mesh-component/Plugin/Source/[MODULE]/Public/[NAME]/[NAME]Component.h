// Copyright Epic Games, Inc. All Rights Reserved.
// Adapted from the VirtualHeightfieldMesh plugin

#pragma once

#include "CoreMinimal.h"
#include "Components/PrimitiveComponent.h"
#include "${NAME}Component.generated.h"

class UMaterialInterface;

UCLASS(Blueprintable, ClassGroup = Rendering, hideCategories = (Activation, Collision, Cooking, HLOD, Navigation, Object, Physics, VirtualTexture))
class ${SCOPE} U${NAME}Component : public UPrimitiveComponent
{
	GENERATED_UCLASS_BODY()

protected:
	/** Material applied to each instance. */
	UPROPERTY(EditAnywhere, Category = Rendering)
	UMaterialInterface* Material = nullptr;

	UPROPERTY(EditAnywhere, Category = Rendering)
	UStaticMesh* StaticMesh = nullptr;

public:

	/** LOD level to use when rendering the mesh */
	UPROPERTY(EditAnywhere, Category = Rendering)
	int LODIndex = 0;

	UMaterialInterface* GetMaterial() const { return Material; }
	UStaticMesh* GetStaticMesh() const { return StaticMesh; }

	UFUNCTION(BlueprintCallable, CallInEditor, Category = Rendering)
	void AddInstances();

protected:
	//~ Begin UActorComponent Interface
	virtual void OnRegister() override;
	virtual void OnUnregister() override;
	virtual void ApplyWorldOffset(const FVector& InOffset, bool bWorldShift) override;
	//~ End UActorComponent Interface

	//~ Begin USceneComponent Interface
	virtual bool IsVisible() const override;
	virtual FBoxSphereBounds CalcBounds(const FTransform& LocalToWorld) const override;
	//~ EndUSceneComponent Interface

	//~ Begin UPrimitiveComponent Interface
	virtual FPrimitiveSceneProxy* CreateSceneProxy() override;
	virtual bool SupportsStaticLighting() const override { return true; }
	virtual void SetMaterial(int32 ElementIndex, class UMaterialInterface* Material) override;
	virtual UMaterialInterface* GetMaterial(int32 Index) const override { return Material; }
	virtual void GetUsedMaterials(TArray<UMaterialInterface*>& OutMaterials, bool bGetDebugMaterials = false) const override;
	//~ End UPrimitiveComponent Interface
};
