// Shared shadeup helpers
#ifndef SHADEUP_LIB_${MODULE_NAME}
#define SHADEUP_LIB_${MODULE_NAME}

#include "Engine/TextureRenderTarget2D.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetRenderingLibrary.h"
#include "Components/StaticMeshComponent.h"

// Actor helpers included in every shadeup actor defined

class ShadeupActorHelpers_${MODULE_NAME} {
public:
	enum MeshShape {
		Cube,
		Sphere,
		Cylinder,
		Plane
	};

	AActor* ThisActor;

	bool bIsInConstructor = true;

	UTextureRenderTarget2D* AddRenderTarget(const int32 Width, const int32 Height, ETextureRenderTargetFormat Format = ETextureRenderTargetFormat::RTF_RGBA8_SRGB);

	TObjectPtr<UStaticMeshComponent> AddStaticMesh(const FString& Name, const MeshShape& Shape, const FVector& Location = FVector(0.f), const FRotator& Rotation = FRotator(0.f), const FVector& Scale = FVector(1.f));
	
	// Called in the actor constructor
	virtual void Setup();
};


#endif