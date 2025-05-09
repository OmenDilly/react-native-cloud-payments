///
/// JHybridCloudPaymentsSpec.cpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#include "JHybridCloudPaymentsSpec.hpp"

// Forward declaration of `ThreeDsResult` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct ThreeDsResult; }
// Forward declaration of `ChargeResult` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct ChargeResult; }
// Forward declaration of `ChargeStatus` to properly resolve imports.
namespace margelo::nitro::cloudpayments { enum class ChargeStatus; }
// Forward declaration of `CardCryptogramParams` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct CardCryptogramParams; }
// Forward declaration of `ThreeDsParams` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct ThreeDsParams; }
// Forward declaration of `ChargeParams` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct ChargeParams; }

#include <NitroModules/Promise.hpp>
#include <NitroModules/JPromise.hpp>
#include <string>
#include "ThreeDsResult.hpp"
#include "JThreeDsResult.hpp"
#include "ChargeResult.hpp"
#include "JChargeResult.hpp"
#include "ChargeStatus.hpp"
#include "JChargeStatus.hpp"
#include <optional>
#include "CardCryptogramParams.hpp"
#include "JCardCryptogramParams.hpp"
#include "ThreeDsParams.hpp"
#include "JThreeDsParams.hpp"
#include "ChargeParams.hpp"
#include "JChargeParams.hpp"

namespace margelo::nitro::cloudpayments {

  jni::local_ref<JHybridCloudPaymentsSpec::jhybriddata> JHybridCloudPaymentsSpec::initHybrid(jni::alias_ref<jhybridobject> jThis) {
    return makeCxxInstance(jThis);
  }

  void JHybridCloudPaymentsSpec::registerNatives() {
    registerHybrid({
      makeNativeMethod("initHybrid", JHybridCloudPaymentsSpec::initHybrid),
    });
  }

  size_t JHybridCloudPaymentsSpec::getExternalMemorySize() noexcept {
    static const auto method = javaClassStatic()->getMethod<jlong()>("getMemorySize");
    return method(_javaPart);
  }

  // Properties
  

  // Methods
  std::shared_ptr<Promise<bool>> JHybridCloudPaymentsSpec::initialize(const std::string& publicId) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* publicId */)>("initialize");
    auto __result = method(_javaPart, jni::make_jstring(publicId));
    return [&]() {
      auto __promise = Promise<bool>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JBoolean>(__boxedResult);
        __promise->resolve(static_cast<bool>(__result->value()));
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<std::string>> JHybridCloudPaymentsSpec::generateCardCryptogram(const CardCryptogramParams& params) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<JCardCryptogramParams> /* params */)>("generateCardCryptogram");
    auto __result = method(_javaPart, JCardCryptogramParams::fromCpp(params));
    return [&]() {
      auto __promise = Promise<std::string>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JString>(__boxedResult);
        __promise->resolve(__result->toStdString());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<bool>> JHybridCloudPaymentsSpec::isCardNumberValid(const std::string& cardNumber) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* cardNumber */)>("isCardNumberValid");
    auto __result = method(_javaPart, jni::make_jstring(cardNumber));
    return [&]() {
      auto __promise = Promise<bool>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JBoolean>(__boxedResult);
        __promise->resolve(static_cast<bool>(__result->value()));
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<bool>> JHybridCloudPaymentsSpec::isExpDateValid(const std::string& expDate) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* expDate */)>("isExpDateValid");
    auto __result = method(_javaPart, jni::make_jstring(expDate));
    return [&]() {
      auto __promise = Promise<bool>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JBoolean>(__boxedResult);
        __promise->resolve(static_cast<bool>(__result->value()));
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<ThreeDsResult>> JHybridCloudPaymentsSpec::show3ds(const ThreeDsParams& params) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<JThreeDsParams> /* params */)>("show3ds");
    auto __result = method(_javaPart, JThreeDsParams::fromCpp(params));
    return [&]() {
      auto __promise = Promise<ThreeDsResult>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<JThreeDsResult>(__boxedResult);
        __promise->resolve(__result->toCpp());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<bool>> JHybridCloudPaymentsSpec::finish3ds(const std::string& transactionId) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<jni::JString> /* transactionId */)>("finish3ds");
    auto __result = method(_javaPart, jni::make_jstring(transactionId));
    return [&]() {
      auto __promise = Promise<bool>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<jni::JBoolean>(__boxedResult);
        __promise->resolve(static_cast<bool>(__result->value()));
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }
  std::shared_ptr<Promise<ChargeResult>> JHybridCloudPaymentsSpec::charge(const ChargeParams& params) {
    static const auto method = javaClassStatic()->getMethod<jni::local_ref<JPromise::javaobject>(jni::alias_ref<JChargeParams> /* params */)>("charge");
    auto __result = method(_javaPart, JChargeParams::fromCpp(params));
    return [&]() {
      auto __promise = Promise<ChargeResult>::create();
      __result->cthis()->addOnResolvedListener([=](const jni::alias_ref<jni::JObject>& __boxedResult) {
        auto __result = jni::static_ref_cast<JChargeResult>(__boxedResult);
        __promise->resolve(__result->toCpp());
      });
      __result->cthis()->addOnRejectedListener([=](const jni::alias_ref<jni::JThrowable>& __throwable) {
        jni::JniException __jniError(__throwable);
        __promise->reject(std::make_exception_ptr(__jniError));
      });
      return __promise;
    }();
  }

} // namespace margelo::nitro::cloudpayments
