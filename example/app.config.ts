import { ExpoConfig } from '@expo/config-types'

const config: ExpoConfig = {
  name: 'example',
  slug: 'example',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.omendilly.example',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.omendilly.example',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
}

// const withCloudPayments: ConfigPlugin = config => {
// 	return withPodfile(config, async config => {
// 		const appDelegate = config.modResults

// 		// Add import
// 		if (!appDelegate.contents.includes('#import <YandexMapsMobile/YMKMapKitFactory.h>')) {
// 			// Replace the first line with the intercom import
// 			appDelegate.contents = appDelegate.contents.replace(
// 				/#import "AppDelegate.h"/g,
// 				`#import "AppDelegate.h"\n#import <YandexMapsMobile/YMKMapKitFactory.h>`
// 			)
// 		}

// 		const mapKitMethodInvocations = [
// 			`[YMKMapKit setApiKey:@"${config.extra?.mapKitApiKey}"];`,
// 			`[YMKMapKit setLocale:@"ru_RU"];`,
// 			`[YMKMapKit mapKit];`
// 		]
// 			.map(line => `\t${line}`)
// 			.join('\n')

// 		// Add invocation
// 		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// 		if (!appDelegate.contents.includes(mapKitMethodInvocations)) {
// 			appDelegate.contents = appDelegate.contents.replace(
// 				/\s+return YES;/g,
// 				`\n\n${mapKitMethodInvocations}\n\n\treturn YES;`
// 			)
// 		}

// 		return config
// 	})
// }

export default config
