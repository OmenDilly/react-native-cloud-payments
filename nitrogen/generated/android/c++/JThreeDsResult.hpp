///
/// JThreeDsResult.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#include <fbjni/fbjni.h>
#include "ThreeDsResult.hpp"

#include <string>

namespace margelo::nitro::cloudpayments {

  using namespace facebook;

  /**
   * The C++ JNI bridge between the C++ struct "ThreeDsResult" and the the Kotlin data class "ThreeDsResult".
   */
  struct JThreeDsResult final: public jni::JavaClass<JThreeDsResult> {
  public:
    static auto constexpr kJavaDescriptor = "Lcom/margelo/nitro/cloudpayments/ThreeDsResult;";

  public:
    /**
     * Convert this Java/Kotlin-based struct to the C++ struct ThreeDsResult by copying all values to C++.
     */
    [[maybe_unused]]
    [[nodiscard]]
    ThreeDsResult toCpp() const {
      static const auto clazz = javaClassStatic();
      static const auto fieldTransactionId = clazz->getField<jni::JString>("transactionId");
      jni::local_ref<jni::JString> transactionId = this->getFieldValue(fieldTransactionId);
      static const auto fieldPaRes = clazz->getField<jni::JString>("paRes");
      jni::local_ref<jni::JString> paRes = this->getFieldValue(fieldPaRes);
      static const auto fieldSuccess = clazz->getField<jboolean>("success");
      jboolean success = this->getFieldValue(fieldSuccess);
      return ThreeDsResult(
        transactionId->toStdString(),
        paRes->toStdString(),
        static_cast<bool>(success)
      );
    }

  public:
    /**
     * Create a Java/Kotlin-based struct by copying all values from the given C++ struct to Java.
     */
    [[maybe_unused]]
    static jni::local_ref<JThreeDsResult::javaobject> fromCpp(const ThreeDsResult& value) {
      return newInstance(
        jni::make_jstring(value.transactionId),
        jni::make_jstring(value.paRes),
        value.success
      );
    }
  };

} // namespace margelo::nitro::cloudpayments
