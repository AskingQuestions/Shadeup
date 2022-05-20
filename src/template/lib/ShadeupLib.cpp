#include "ShadeupLib.h"

UTextureRenderTarget2D* ShadeupActorHelpers_${MODULE_NAME}::AddRenderTarget(const int32 Width, const int32 Height, ETextureRenderTargetFormat Format) {
	// return UKismetRenderingLibrary::CreateRenderTarget2D(ThisActor, Width, Height, Format);

	auto RenderTarget = NewObject<UTextureRenderTarget2D>(ThisActor);
	check(RenderTarget);
	RenderTarget->RenderTargetFormat = Format;
	RenderTarget->ClearColor = FLinearColor(0, 0, 0, 0);
	RenderTarget->bAutoGenerateMips = false;
	RenderTarget->AddressX = TextureAddress::TA_Clamp;
	RenderTarget->AddressY = TextureAddress::TA_Clamp;
	RenderTarget->SRGB = false;
	RenderTarget->Filter = TextureFilter::TF_Bilinear;
	RenderTarget->InitAutoFormat(Width, Height);
	RenderTarget->bCanCreateUAV = true;
	RenderTarget->UpdateResourceImmediate(true);

	return RenderTarget;
}

TObjectPtr<UStaticMeshComponent> ShadeupActorHelpers_${MODULE_NAME}::AddStaticMesh(const FString& Name, const MeshShape& Shape, const FVector& Location, const FRotator& Rotation, const FVector& Scale) {
	UStaticMeshComponent* Comp = nullptr;

	if (bIsInConstructor) {
		Comp = ThisActor->CreateDefaultSubobject<UStaticMeshComponent>(FName(Name));
		Comp->SetupAttachment(ThisActor->GetRootComponent());
		Comp->SetRelativeLocation(Location);
		Comp->SetRelativeRotation(Rotation);
		Comp->SetRelativeScale3D(Scale); 
	}else{
		Comp = NewObject<UStaticMeshComponent>(ThisActor, FName(Name));
		if(!Comp) {
			return NULL;
		}

		Comp->RegisterComponent();
		Comp->SetWorldLocation(Location); 
		Comp->SetWorldRotation(Rotation); 
		Comp->SetRelativeScale3D(Scale); 
		Comp->SetupAttachment(ThisActor->GetRootComponent());
	}

	if (Shape == MeshShape::Cube) {
		static ConstructorHelpers::FObjectFinder<UStaticMesh> MeshAsset(TEXT("StaticMesh'/Engine/BasicShapes/Cube.Cube'"));
		Comp->SetStaticMesh(MeshAsset.Object);
	}
	else if (Shape == MeshShape::Sphere) {
		static ConstructorHelpers::FObjectFinder<UStaticMesh> MeshAsset(TEXT("StaticMesh'/Engine/BasicShapes/Sphere.Sphere'"));
		Comp->SetStaticMesh(MeshAsset.Object);
	}
	else if (Shape == MeshShape::Cylinder) {
		static ConstructorHelpers::FObjectFinder<UStaticMesh> MeshAsset(TEXT("StaticMesh'/Engine/BasicShapes/Cylinder.Cylinder'"));
		Comp->SetStaticMesh(MeshAsset.Object);
	}
	else if (Shape == MeshShape::Plane) {
		static ConstructorHelpers::FObjectFinder<UStaticMesh> MeshAsset(TEXT("StaticMesh'/Engine/BasicShapes/Plane.Plane'"));
		Comp->SetStaticMesh(MeshAsset.Object);
	}
	
	return TObjectPtr<UStaticMeshComponent>(Comp);
}


void ShadeupActorHelpers_${MODULE_NAME}::Setup() {}