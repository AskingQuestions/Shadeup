#include "Actors/${instance.nameWithoutPrefix}.h"

${instance.code("PrivateInclude")}

${NAME}::${NAME}() {
	PrimaryActorTick.bCanEverTick = true;
	PrimaryActorTick.bStartWithTickEnabled = true;

	ThisActor = this;
	
	SceneComponent = CreateDefaultSubobject<USceneComponent>(TEXT("SceneComponent"));
	SetRootComponent(SceneComponent);

	Setup();

	bIsInConstructor = false;
}

void ${NAME}::BeginPlay() {
	Super::BeginPlay();
}

${instance.code("Body")}