#include "GameFramework/Actor.h"

// Shadeup provided helper functions
#include "ShadeupLib.h"

// Commonly included headers
#include "Engine/Texture.h"
#include "Engine/TextureRenderTarget2D.h"
#include "Components/StaticMeshComponent.h"

// User defined includes
${instance.code("Include")}

#include "${instance.nameWithoutPrefix}.generated.h"

UCLASS()
class ${NAME} : public AActor, public ShadeupActorHelpers_${MODULE_NAME}
{
    GENERATED_BODY()

public:
	UPROPERTY(EditAnywhere, BlueprintReadWrite)
	class USceneComponent* SceneComponent;

	${NAME}();

    ${instance.code("Header")}
	
protected:
    // Called when the game starts or when spawned
    virtual void BeginPlay() override;
};