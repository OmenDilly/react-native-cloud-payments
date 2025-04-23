package com.cloudpayments

import android.app.Activity
import android.content.Intent
import android.util.Log
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.reactnativecloudpayments.CloudpaymentsSpec
import com.reactnativecloudpayments.CardCryptogramParams
import com.reactnativecloudpayments.ThreeDsParams
import com.reactnativecloudpayments.ThreeDsResult
import com.reactnativecloudpayments.ChargeParams
import com.reactnativecloudpayments.ChargeResult
import ru.cloudpayments.sdk.Card
import ru.cloudpayments.sdk.three_ds.ThreeDsDialogFragment
import ru.cloudpayments.sdk.three_ds.ThreeDsDialogListener
import java.lang.Exception
import java.util.concurrent.atomic.AtomicReference
import java.net.URL
import java.net.HttpURLConnection
import org.json.JSONObject
import java.io.DataOutputStream
import java.io.BufferedReader
import java.io.InputStreamReader
import margelo.nitro.NitroModules.HybridObjectProvider
import margelo.nitro.cloudpayments.HybridCloudPaymentsSpec

class HybridCloudPayments : HybridCloudPaymentsSpec {
    private var publicId: String = ""
    private var currentActivity: Activity? = null
    private var threeDsResolver: AtomicReference<((ThreeDsResult) -> Unit)?> = AtomicReference(null)

    override fun initialize(publicId: String): Promise<Boolean> {
        return Promise.async {
            this.publicId = publicId
            true
        }
    }

    override fun generateCardCryptogram(params: CardCryptogramParams): Promise<String> {
        return Promise.async {
            // Using CloudPayments SDK to create a cryptogram
            val cardCryptogram = Card.cardCryptogram(
                params.cardNumber,
                params.expDate,
                params.cvv,
                publicId
            )

            if (cardCryptogram == null) {
                throw Exception("Failed to create card cryptogram packet")
            }

            cardCryptogram
        }
    }

    override fun isCardNumberValid(cardNumber: String): Promise<Boolean> {
        return Promise.async {
            Card.isValidNumber(cardNumber)
        }
    }

    override fun isExpDateValid(expDate: String): Promise<Boolean> {
        return Promise.async {
            Card.isValidExpDate(expDate)
        }
    }

    override fun show3ds(params: ThreeDsParams): Promise<ThreeDsResult> {
        return Promise { resolver ->
            try {
                val activity = getCurrentActivity()
                if (activity == null) {
                    throw Exception("Activity is null. Cannot show 3DS dialog.")
                }

                // Save the resolver to access it from the callback
                threeDsResolver.set { result -> resolver.resolve(result) }

                // Get the fragment manager from the current activity
                val fragmentManager = activity.fragmentManager

                // Create the 3DS dialog
                val threeDsDialog = ThreeDsDialogFragment.newInstance(
                    params.acsUrl,
                    params.transactionId,
                    params.paReq,
                    object : ThreeDsDialogListener {
                        override fun onAuthorizationCompleted(md: String, paRes: String) {
                            // 3DS authorization completed successfully
                            val result = ThreeDsResult(
                                transactionId = md,
                                paRes = paRes,
                                success = true
                            )
                            threeDsResolver.getAndSet(null)?.invoke(result)
                        }

                        override fun onAuthorizationFailed(html: String?) {
                            // 3DS authorization failed
                            val result = ThreeDsResult(
                                transactionId = params.transactionId,
                                paRes = "",
                                success = false
                            )
                            threeDsResolver.getAndSet(null)?.invoke(result)
                        }
                    }
                )

                // Show the dialog
                threeDsDialog.show(fragmentManager, "3DS")
            } catch (e: Exception) {
                resolver.reject(e)
            }
        }
    }

    override fun finish3ds(transactionId: String): Promise<Boolean> {
        return Promise.async {
            // Here you would typically finalize the 3DS process
            // For CloudPayments, this might involve sending a server request
            // But often this is handled by the server after receiving the PaRes
            true
        }
    }

    override fun charge(params: ChargeParams): Promise<ChargeResult> {
        return Promise.async {
            // Check if we have a cryptogram or need to create one
            var cryptogram = params.cardCryptogram

            // If no cryptogram but we have card details, create one
            if (cryptogram == null && params.cardNumber != null && params.expDate != null && params.cvv != null) {
                val generatedCryptogram = Card.cardCryptogram(
                    params.cardNumber,
                    params.expDate,
                    params.cvv,
                    publicId
                )

                if (generatedCryptogram == null) {
                    throw Exception("Failed to create card cryptogram packet")
                }

                cryptogram = generatedCryptogram
            }

            // Ensure we have a cryptogram
            if (cryptogram == null) {
                throw Exception("Missing cryptogram or card details")
            }

            // Create request data
            val url = URL("https://api.cloudpayments.ru/payments/cards/charge")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")

            // Add authorization header with base64 encoded public ID
            val authString = "$publicId:"
            val authData = authString.toByteArray(Charsets.UTF_8)
            val authBase64 = Base64.encodeToString(authData, Base64.NO_WRAP)
            connection.setRequestProperty("Authorization", "Basic $authBase64")

            // Prepare request body
            val requestBody = JSONObject().apply {
                put("Amount", params.amount)
                put("Currency", params.currency)
                put("IpAddress", "127.0.0.1") // Should be the real IP in production
                put("Description", params.description)
                put("CardCryptogramPacket", cryptogram)

                // Add optional fields if provided
                params.accountId?.let { put("AccountId", it) }
                params.email?.let { put("Email", it) }
            }

            // Convert body to JSON string
            val jsonData = requestBody.toString()
            connection.doOutput = true

            // Send request
            DataOutputStream(connection.outputStream).use { it.writeBytes(jsonData) }

            // Read response
            val responseCode = connection.responseCode
            val inputStream = if (responseCode >= 400) {
                connection.errorStream
            } else {
                connection.inputStream
            }

            val responseBody = BufferedReader(InputStreamReader(inputStream)).use {
                it.readLines().joinToString("\n")
            }

            // Parse response
            val jsonResponse = JSONObject(responseBody)
            val success = jsonResponse.optBoolean("Success", false)

            if (!success && !jsonResponse.has("Model")) {
                throw Exception(jsonResponse.optString("Message", "Payment failed"))
            }

            val model = jsonResponse.optJSONObject("Model") ?: JSONObject()

            // Get transaction details
            val transactionId = model.optString("TransactionId", "")
            val status = model.optString("Status", "")
            val reasonCode = if (model.has("ReasonCode")) model.getInt("ReasonCode") else null
            val reasonMessage = model.optString("CardHolderMessage", null)

            var statusEnum = "Declined"
            if (status == "Completed") {
                statusEnum = "Completed"
            } else if (status == "Authorized") {
                statusEnum = "Authorized"
            } else if (model.has("PaReq") && model.has("AcsUrl")) {
                statusEnum = "ThreeDS"
            }

            val paReq = model.optString("PaReq", null)
            val acsUrl = model.optString("AcsUrl", null)

            ChargeResult(
                transactionId = transactionId,
                status = statusEnum,
                reasonCode = reasonCode,
                reasonMessage = reasonMessage,
                paReq = paReq,
                acsUrl = acsUrl,
                success = success
            )
        }
    }

    private fun getCurrentActivity(): Activity? {
        return currentActivity
    }

    fun setCurrentActivity(activity: Activity?) {
        currentActivity = activity
    }
}
