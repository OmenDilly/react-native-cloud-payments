///
/// JThreeDsParams.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include "ThreeDsParams.hpp"

#include <string>

namespace margelo::nitro::cloudpayments {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ struct "ThreeDsParams" and the the Kotlin data class "ThreeDsParams".
   */
  struct JThreeDsParams final: public jni::JavaClass<JThreeDsParams> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/cloudpayments/ThreeDsParams;";

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct ThreeDsParams by copying all values to C++.
     */
    [[maybe_unused]]
    [[nodiscard]]
    ThreeDsParams toCpp() const {
      static const auto clazz = javaClassStatic();
      static const auto fieldTransactionId = clazz->getField<jni::JString>("transactionId");
      jni::local_ref<jni::JString> transactionId = this->getFieldValue(fieldTransactionId);
      static const auto fieldPaReq = clazz->getField<jni::JString>("paReq");
      jni::local_ref<jni::JString> paReq = this->getFieldValue(fieldPaReq);
      static const auto fieldAcsUrl = clazz->getField<jni::JString>("acsUrl");
      jni::local_ref<jni::JString> acsUrl = this->getFieldValue(fieldAcsUrl);
      return ThreeDsParams(
        transactionId->toStdString(),
        paReq->toStdString(),
        acsUrl->toStdString()
      );
    }

  public:
    /**
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    [[maybe_unused]]
    static jni::local_ref<JThreeDsParams::javaobject> fromCpp(const ThreeDsParams& value) {
      return newInstance(
        jni::make_jstring(value.transactionId),
        jni::make_jstring(value.paReq),
        jni::make_jstring(value.acsUrl)
      );
    }
  };

} // namespace margelo::nitro::cloudpayments
