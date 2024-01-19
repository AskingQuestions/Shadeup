#include "${MODULE_NAME}/Public/${MODULE_NAME}.h"

#include "Misc/Paths.h"
#include "Misc/FileHelper.h"
#include "RHI.h"
#include "GlobalShader.h"
#include "RHICommandList.h"
#include "RenderGraphBuilder.h"
#include "RenderTargetPool.h"
#include "Runtime/Core/Public/Modules/ModuleManager.h"
#include "Interfaces/IPluginManager.h"

#define LOCTEXT_NAMESPACE "${MODULE_NAME}Module"

void F${MODULE_NAME}Module::StartupModule()
{
	// This code will execute after your module is loaded into memory; the exact timing is specified in the .uplugin file per-module

	// Maps virtual shader source directory to the plugin's actual shaders directory.
	FString PluginShaderDir = FPaths::Combine(IPluginManager::Get().FindPlugin(TEXT("${PLUGIN_NAME}"))->GetBaseDir(), TEXT("Shaders/${MODULE_NAME}/Private"));
	AddShaderSourceDirectoryMapping(TEXT("/${MODULE_NAME}Shaders"), PluginShaderDir);
}

void F${MODULE_NAME}Module::ShutdownModule()
{
	// This function may be called during shutdown to clean up your module.  For modules that support dynamic reloading,
	// we call this function before unloading the module.
}

#undef LOCTEXT_NAMESPACE

IMPLEMENT_MODULE(F${MODULE_NAME}Module, ${MODULE_NAME})