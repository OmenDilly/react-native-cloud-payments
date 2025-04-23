package com.cloudpayments

import margelo.nitro.cloudpayments.HybridCloudPaymentsSpec

object NitroCloudPaymentsInitializer {
    @JvmStatic
    fun registerComponents() {
        // Register the HybridCloudPayments provider
        HybridCloudPaymentsSpec.register(HybridCloudPaymentsProvider())
    }
}
