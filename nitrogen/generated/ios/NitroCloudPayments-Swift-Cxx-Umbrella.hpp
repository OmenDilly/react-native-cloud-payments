///
/// NitroCloudPayments-Swift-Cxx-Umbrella.hpp
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

#pragma once

// Forward declarations of C++ defined types
// Forward declaration of `CardCryptogramParams` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct CardCryptogramParams; }
// Forward declaration of `ChargeParams` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct ChargeParams; }
// Forward declaration of `ChargeResult` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct ChargeResult; }
// Forward declaration of `ChargeStatus` to properly resolve imports.
namespace margelo::nitro::cloudpayments { enum class ChargeStatus; }
// Forward declaration of `HybridCloudPaymentsSpec` to properly resolve imports.
namespace margelo::nitro::cloudpayments { class HybridCloudPaymentsSpec; }
// Forward declaration of `ThreeDsParams` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct ThreeDsParams; }
// Forward declaration of `ThreeDsResult` to properly resolve imports.
namespace margelo::nitro::cloudpayments { struct ThreeDsResult; }

// Include C++ defined types
#include "CardCryptogramParams.hpp"
#include "ChargeParams.hpp"
#include "ChargeResult.hpp"
#include "ChargeStatus.hpp"
#include "HybridCloudPaymentsSpec.hpp"
#include "ThreeDsParams.hpp"
#include "ThreeDsResult.hpp"
#include <NitroModules/Promise.hpp>
#include <NitroModules/Result.hpp>
#include <exception>
#include <memory>
#include <optional>
#include <string>

// C++ helpers for Swift
#include "NitroCloudPayments-Swift-Cxx-Bridge.hpp"

// Common C++ types used in Swift
#include <NitroModules/ArrayBufferHolder.hpp>
#include <NitroModules/AnyMapHolder.hpp>
#include <NitroModules/RuntimeError.hpp>

// Forward declarations of Swift defined types
// Forward declaration of `HybridCloudPaymentsSpec_cxx` to properly resolve imports.
namespace NitroCloudPayments { class HybridCloudPaymentsSpec_cxx; }

// Include Swift defined types
#if __has_include("NitroCloudPayments-Swift.h")
// This header is generated by Xcode/Swift on every app build.
// If it cannot be found, make sure the Swift module's name (= podspec name) is actually "NitroCloudPayments".
#include "NitroCloudPayments-Swift.h"
// Same as above, but used when building with frameworks (`use_frameworks`)
#elif __has_include(<NitroCloudPayments/NitroCloudPayments-Swift.h>)
#include <NitroCloudPayments/NitroCloudPayments-Swift.h>
#else
#error NitroCloudPayments's autogenerated Swift header cannot be found! Make sure the Swift module's name (= podspec name) is actually "NitroCloudPayments", and try building the app first.
#endif
