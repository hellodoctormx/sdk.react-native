package com.hellodoctormx.sdk.auth

import android.content.Context
import com.hellodoctormx.sdk.api.UserServiceClient

class HDCurrentUser {
    companion object {
        var uid: String? = null
        var jwt: String? = null
        var refreshToken: String? = null

        suspend fun signIn(context: Context, userID: String, serverAuthToken: String) {
            val userServiceClient = UserServiceClient(context)

            val response = userServiceClient.authenticateUser(userID, serverAuthToken)

            uid = userID
            jwt = response.bearerToken
            refreshToken = response.refreshToken
        }

        fun signOut() {
            uid = null
            jwt = null
            refreshToken = null
        }

        suspend fun refreshJWT(context: Context) {
            signIn(context, uid!!, refreshToken!!)
        }
    }
}