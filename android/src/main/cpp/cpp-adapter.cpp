#include <jni.h>
#include "NitroCloudPaymentsOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *)
{
  return margelo::nitro::cloudpayments::initialize(vm);
}
