package com.hellodoctormx.sdk

import android.content.Context
import com.hellodoctormx.sdk.api.AbstractHelloDoctorAPI
import com.hellodoctormx.sdk.api.UserServiceClient
import com.hellodoctormx.sdk.auth.HDCurrentUser
import com.hellodoctormx.sdk.types.Consultation
import kotlinx.coroutines.runBlocking

class HelloDoctorClient(private val context: Context) {
    private val userServiceClient = UserServiceClient(context)

    suspend fun signIn(userID: String, serverAuthToken: String) {
        HDCurrentUser.signIn(context, userID, serverAuthToken)
    }

    fun signOut() {
        HDCurrentUser.signOut()
    }

    fun createUser(email: String): String {
        var response: UserServiceClient.CreateUserResponse

        runBlocking {
            response = userServiceClient.createUser(email)
        }

        return response.uid
    }

    fun getConsultations(limit: Int): List<Consultation> {
        var response: UserServiceClient.GetUserConsultationsResponse

        runBlocking {
            response = userServiceClient.getUserConsultations(limit)
        }

        return response.consultations
    }

    fun registerIncomingVideoCall(videoRoomSID: String, callerDisplayName: String) {
        IncomingVideoCall.videoRoomSID = videoRoomSID
        IncomingVideoCall.callerDisplayName = callerDisplayName
    }

    companion object {
        var apiKey: String? = null
        var serviceHost: String? = null

        fun configure(apiKey: String, serviceHost: String) {
            AbstractHelloDoctorAPI.apiKey = apiKey
            AbstractHelloDoctorAPI.defaultServiceHost = serviceHost
        }
    }

    object IncomingVideoCall {
        var videoRoomSID: String? = null
        var callerDisplayName: String? = null
    }
}
