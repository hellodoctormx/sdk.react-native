package com.hellodoctormx.sdk.api

import android.content.Context
import android.util.Log
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import com.hellodoctormx.sdk.auth.HDCurrentUser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import org.json.JSONObject

const val LOCAL_PUBLIC_API_HOST = "http://192.168.100.26:3010"

abstract class AbstractHelloDoctorAPI(
    val context: Context,
    val host: String? = defaultServiceHost
) {
    suspend inline fun <reified T> get(path: String): T {
        return doRequest(Request.Method.GET, path, null)
    }

    suspend inline fun <reified T> post(path: String, postData: MutableMap<Any, Any>?): T {
        return doRequest(Request.Method.POST, path, postData)
    }

    suspend inline fun <reified T> put(path: String, postData: MutableMap<Any, Any>?): T {
        return doRequest(Request.Method.PUT, path, postData)
    }

    suspend inline fun <reified T> delete(path: String): T {
        return doRequest(Request.Method.DELETE, path, null)
    }

    suspend inline fun <reified T> doRequest(method: Int, path: String, data: MutableMap<Any, Any>?): T {
        val responseChannel = Channel<String>()

        val url = "$host$path"

        val jsonPostData = if (data == null) JSONObject() else JSONObject(data as Map<Any, Any>)

        val jsonObjectRequest = object : JsonObjectRequest(
            method,
            url,
            jsonPostData,
            {
                runBlocking(Dispatchers.IO) {
                    responseChannel.send(it.toString())
                }

                responseChannel.close()
            },
            {
                Log.w("AbstractServiceClient","[doRequest:$method:$url:ERROR] ${it.message}")
                throw it
            }
        ) {
            override fun getHeaders(): MutableMap<String, String> {
                return getAuthorizationHeaders()
            }
        }

        val queue = Volley.newRequestQueue(context)
        queue.add(jsonObjectRequest)

        val response = responseChannel.receive()

        return Json.decodeFromString(response)
    }

    fun getAuthorizationHeaders(): MutableMap<String, String> {
        val headers = HashMap<String, String>()
        headers["Content-Type"] = "application/json"

        HDCurrentUser.jwt?.let {
            headers["Authorization"] = "Bearer $it"
        }

        apiKey?.let {
            headers["X-Api-Key"] = it
        }

        return headers
    }

    companion object {
        var apiKey: String? = null
        var defaultServiceHost: String? = null
    }
}