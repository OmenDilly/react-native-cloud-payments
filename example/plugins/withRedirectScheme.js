"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withRedirectScheme = config => {
    return (0, config_plugins_1.withAppBuildGradle)(config, config => {
        if (config.modResults.language === 'groovy') {
            // Using regex to insert manifestPlaceholders
            let gradleContent = config.modResults.contents;
            const manifestPlaceholders = `manifestPlaceholders = [YANDEX_CLIENT_ID: "Test"]`;
            const defaultConfigPattern = /defaultConfig \{/;
            if (!gradleContent.match(manifestPlaceholders)) {
                gradleContent = gradleContent.replace(defaultConfigPattern, `defaultConfig {\n        ${manifestPlaceholders}`);
            }
            config.modResults.contents = gradleContent;
        }
        return config;
    });
};
exports.default = withRedirectScheme;
