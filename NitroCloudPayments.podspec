require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

min_ios_version_supported = '13.0'

Pod::Spec.new do |s|
  s.name         = "NitroCloudPayments"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported, :visionos => 1.0 }
  s.source       = { :git => "https://github.com/mrousavy/nitro.git", :tag => "#{s.version}" }

  s.source_files = [
    # Implementation (Swift)
    "ios/**/*.{swift}",
    # Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
    # Headers
    "ios/**/*.h"
  ]

  s.pod_target_xcconfig = {
    # C++ compiler flags, mainly for folly.
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) FOLLY_NO_CONFIG FOLLY_CFG_NO_COROUTINES",
    "SWIFT_INCLUDE_PATHS" => "${PODS_TARGET_SRCROOT}/ios/implementation",
    "HEADER_SEARCH_PATHS" => "$(inherited) ${PODS_TARGET_SRCROOT}/ios/implementation",
    "MODULEMAP_FILE" => "${PODS_TARGET_SRCROOT}/ios/implementation/module.modulemap"
  }

  load 'nitrogen/generated/ios/NitroCloudPayments+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  s.dependency 'Cloudpayments'
  s.frameworks = 'WebKit'
  install_modules_dependencies(s)
end
