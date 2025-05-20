package com.margelo.nitro.cloudpayments

import ru.cloudpayments.sdk.card.Card
import com.margelo.nitro.cloudpayments.CardCryptogramParams
import com.margelo.nitro.core.Promise
import com.margelo.nitro.cloudpayments.HybridCloudPaymentsSpec
import android.util.Log
import java.security.KeyFactory
import java.security.PublicKey
import java.security.spec.X509EncodedKeySpec
import android.util.Base64

class HybridCloudPayments: HybridCloudPaymentsSpec() {
    private var publicId: String = ""
    private var publicKey: String = ""
    private var keyVersion: Double = 0.0
    // private var rsaPublicKey: PublicKey? = null

    override fun initialize(publicId: String, publicKey: String, keyVersion: Double): Promise<Boolean> {
        return Promise.async {
            try {
                this.publicId = publicId
                this.publicKey = publicKey
                this.keyVersion = keyVersion

                // // Format and store the RSA public key
                // val publicKeyPEM = publicKey
                //     .replace("-----BEGIN PUBLIC KEY-----", "")
                //     .replace("-----END PUBLIC KEY-----", "")
                //     .replace("\n", "")

                // val keyBytes = Base64.decode(publicKeyPEM, Base64.DEFAULT)
                // val spec = X509EncodedKeySpec(keyBytes)
                // val keyFactory = KeyFactory.getInstance("RSA")
                // this.rsaPublicKey = keyFactory.generatePublic(spec)

                Log.d("CloudPayments", "Successfully initialized with public key")
                true
            } catch (e: Exception) {
                Log.e("CloudPayments", "Error initializing: ${e.message}", e)
                throw e
            }
        }
    }

    override fun generateCardCryptogram(params: CardCryptogramParams): Promise<String> {
        return Promise.async {
            try {
                if (publicKey == null || publicId == null || keyVersion == null) {
                    throw IllegalStateException("public key, publicId, or keyVersion is not initialized. Please call initialize first.")
                }

                Log.d("CloudPayments", "Generating cryptogram with: cardNumber=${params.cardNumber.take(6)}..., expDate=${params.expDate}, publicId=$publicId")


                val cryptogram = Card.createHexPacketFromData(
                    params.cardNumber,
                    params.expDate,
                    params.cvv,
                    publicId,
                    publicKey,
                    keyVersion.toInt()
                )

                cryptogram ?: throw Exception("Failed to create card cryptogram packet: SDK returned null")

                Log.d("CloudPayments", "Successfully generated cryptogram")
                cryptogram
            } catch (e: Exception) {
                Log.e("CloudPayments", "Error generating cryptogram: ${e.message}", e)
                throw e
            }
        }
    }
}
