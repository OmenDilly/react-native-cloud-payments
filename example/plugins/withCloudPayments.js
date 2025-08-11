"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
// Plugin to add Cloudpayments Pods
const withCloudpaymentsPods = config => {
    return (0, config_plugins_1.withPodfile)(config, podfileConfig => {
        const podLinesToAdd = [
            `  pod 'Cloudpayments', :git => "https://gitpub.cloudpayments.ru/integrations/sdk/cloudpayments-ios", :branch => "master"`,
            `  pod 'CloudpaymentsNetworking', :git => "https://gitpub.cloudpayments.ru/integrations/sdk/cloudpayments-ios", :branch => "master"`
        ];
        // Check if the lines already exist to prevent duplicates
        if (podLinesToAdd.every(line => podfileConfig.modResults.contents.includes(line.trim()))) {
            console.log('Cloudpayments pods already found in Podfile. Skipping addition.');
            return podfileConfig;
        }
        // Find the 'use_expo_modules!' line or a similar marker to insert before
        const marker = 'use_expo_modules!';
        const contents = podfileConfig.modResults.contents;
        const insertionIndex = contents.indexOf(marker);
        if (insertionIndex !== -1) {
            // Insert the lines before the marker
            const prefix = contents.substring(0, insertionIndex);
            const suffix = contents.substring(insertionIndex);
            podfileConfig.modResults.contents = `${prefix}${podLinesToAdd.join('\n')}\n  ${suffix}`; // Added newline and indentation for suffix
            console.log('Added Cloudpayments pods to Podfile.');
        }
        else {
            // Fallback: If marker isn't found, maybe append inside the main target before the last 'end'?
            // This is less reliable and might need adjustment based on your specific Podfile structure.
            console.warn(`Could not find '${marker}' in Podfile. Attempting fallback insertion for Cloudpayments pods. Please verify Podfile structure.`);
            const endMarker = '\nend'; // Look for the end of the target block
            const lastEndIndex = contents.lastIndexOf(endMarker);
            if (lastEndIndex !== -1) {
                const prefix = contents.substring(0, lastEndIndex);
                const suffix = contents.substring(lastEndIndex);
                podfileConfig.modResults.contents = `${prefix}\n${podLinesToAdd.join('\n')}${suffix}`;
                console.log('Added Cloudpayments pods using fallback method.');
            }
            else {
                // If no reliable insertion point is found, log an error.
                console.error('Failed to add Cloudpayments pods: Could not find a suitable insertion point in Podfile.');
                // Optionally, throw an error to halt the process:
                // throw new Error("Failed to modify Podfile for Cloudpayments pods.");
            }
        }
        return podfileConfig;
    });
};
exports.default = withCloudpaymentsPods;
