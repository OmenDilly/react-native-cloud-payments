///
/// ChargeResult.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

#if __has_include(<NitroModules/JSIConverter.hpp>)
#include <NitroModules/JSIConverter.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif
#if __has_include(<NitroModules/NitroDefines.hpp>)
#include <NitroModules/NitroDefines.hpp>
#else
#error NitroModules cannot be found! Are you sure you installed NitroModules properly?
#endif

// Forward declaration of `ChargeStatus` to properly resolve imports.
namespace margelo::nitro::cloudpayments { enum class ChargeStatus; }

#include <string>
#include "ChargeStatus.hpp"
#include <optional>

namespace margelo::nitro::cloudpayments {

  /**
   * A struct which can be represented as a JavaScript object (ChargeResult).
   */
  struct ChargeResult {
  public:
    std::string transactionId     SWIFT_PRIVATE;
    ChargeStatus status     SWIFT_PRIVATE;
    std::optional<double> reasonCode     SWIFT_PRIVATE;
    std::optional<std::string> reasonMessage     SWIFT_PRIVATE;
    std::optional<std::string> paReq     SWIFT_PRIVATE;
    std::optional<std::string> acsUrl     SWIFT_PRIVATE;
    bool success     SWIFT_PRIVATE;

  public:
    ChargeResult() = default;
    explicit ChargeResult(std::string transactionId, ChargeStatus status, std::optional<double> reasonCode, std::optional<std::string> reasonMessage, std::optional<std::string> paReq, std::optional<std::string> acsUrl, bool success): transactionId(transactionId), status(status), reasonCode(reasonCode), reasonMessage(reasonMessage), paReq(paReq), acsUrl(acsUrl), success(success) {}
  };

} // namespace margelo::nitro::cloudpayments

namespace margelo::nitro {

  using namespace margelo::nitro::cloudpayments;

  // C++ ChargeResult <> JS ChargeResult (object)
  template <>
  struct JSIConverter<ChargeResult> final {
    static inline ChargeResult fromJSI(jsi::Runtime& runtime, const jsi::Value& arg) {
      jsi::Object obj = arg.asObject(runtime);
      return ChargeResult(
        JSIConverter<std::string>::fromJSI(runtime, obj.getProperty(runtime, "transactionId")),
        JSIConverter<ChargeStatus>::fromJSI(runtime, obj.getProperty(runtime, "status")),
        JSIConverter<std::optional<double>>::fromJSI(runtime, obj.getProperty(runtime, "reasonCode")),
        JSIConverter<std::optional<std::string>>::fromJSI(runtime, obj.getProperty(runtime, "reasonMessage")),
        JSIConverter<std::optional<std::string>>::fromJSI(runtime, obj.getProperty(runtime, "paReq")),
        JSIConverter<std::optional<std::string>>::fromJSI(runtime, obj.getProperty(runtime, "acsUrl")),
        JSIConverter<bool>::fromJSI(runtime, obj.getProperty(runtime, "success"))
      );
    }
    static inline jsi::Value toJSI(jsi::Runtime& runtime, const ChargeResult& arg) {
      jsi::Object obj(runtime);
      obj.setProperty(runtime, "transactionId", JSIConverter<std::string>::toJSI(runtime, arg.transactionId));
      obj.setProperty(runtime, "status", JSIConverter<ChargeStatus>::toJSI(runtime, arg.status));
      obj.setProperty(runtime, "reasonCode", JSIConverter<std::optional<double>>::toJSI(runtime, arg.reasonCode));
      obj.setProperty(runtime, "reasonMessage", JSIConverter<std::optional<std::string>>::toJSI(runtime, arg.reasonMessage));
      obj.setProperty(runtime, "paReq", JSIConverter<std::optional<std::string>>::toJSI(runtime, arg.paReq));
      obj.setProperty(runtime, "acsUrl", JSIConverter<std::optional<std::string>>::toJSI(runtime, arg.acsUrl));
      obj.setProperty(runtime, "success", JSIConverter<bool>::toJSI(runtime, arg.success));
      return obj;
    }
    static inline bool canConvert(jsi::Runtime& runtime, const jsi::Value& value) {
      if (!value.isObject()) {
        return false;
      }
      jsi::Object obj = value.getObject(runtime);
      if (!JSIConverter<std::string>::canConvert(runtime, obj.getProperty(runtime, "transactionId"))) return false;
      if (!JSIConverter<ChargeStatus>::canConvert(runtime, obj.getProperty(runtime, "status"))) return false;
      if (!JSIConverter<std::optional<double>>::canConvert(runtime, obj.getProperty(runtime, "reasonCode"))) return false;
      if (!JSIConverter<std::optional<std::string>>::canConvert(runtime, obj.getProperty(runtime, "reasonMessage"))) return false;
      if (!JSIConverter<std::optional<std::string>>::canConvert(runtime, obj.getProperty(runtime, "paReq"))) return false;
      if (!JSIConverter<std::optional<std::string>>::canConvert(runtime, obj.getProperty(runtime, "acsUrl"))) return false;
      if (!JSIConverter<bool>::canConvert(runtime, obj.getProperty(runtime, "success"))) return false;
      return true;
    }
  };

} // namespace margelo::nitro
