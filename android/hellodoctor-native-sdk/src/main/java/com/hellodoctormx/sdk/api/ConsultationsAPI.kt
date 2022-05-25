package com.hellodoctormx.sdk.api

import android.content.Context
import com.hellodoctormx.sdk.types.Consultation
import kotlinx.serialization.Serializable

class ConsultationsAPI(context: Context, host: String? = LOCAL_PUBLIC_API_HOST) : AbstractHelloDoctorAPI(context, host = host) {
    suspend fun getUserConsultations(limit: Int): GetUserConsultationsResponse {
        return this.get(
            path = "/consultations?limit=$limit"
        )
    }

    @Serializable
    data class GetUserConsultationsResponse(val consultations: List<Consultation>)
}
