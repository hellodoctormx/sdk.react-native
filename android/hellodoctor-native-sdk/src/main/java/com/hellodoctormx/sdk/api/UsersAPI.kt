package com.hellodoctormx.sdk.api

import android.content.Context
import com.hellodoctormx.sdk.types.Consultation
import kotlinx.serialization.Serializable

class UserServiceClient(
    context: Context,
    host: String? = LOCAL_PUBLIC_API_HOST
) : AbstractHelloDoctorAPI(context, host = host) {
    suspend fun createUser(email: String): CreateUserResponse {
        return this.post(
            path = "/users",
            postData = mutableMapOf(
                "email" to email,
            )
        )
    }

    suspend fun authenticateUser(userID: String, refreshToken: String): AuthenticateUserResponse {
        return this.post(
            path = "/users/$userID/_authenticate",
            postData = mutableMapOf("refreshToken" to refreshToken)
        )
    }

    suspend fun getUserConsultations(limit: Int): GetUserConsultationsResponse {
        return this.get(
            path = "/consultations?limit=$limit"
        )
    }

    @Serializable
    data class CreateUserResponse(val uid: String)

    @Serializable
    data class AuthenticateUserResponse(val bearerToken: String, val refreshToken: String)

    @Serializable
    data class GetUserConsultationsResponse(val consultations: List<Consultation>)
}
