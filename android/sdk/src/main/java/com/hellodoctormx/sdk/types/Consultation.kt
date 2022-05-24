package com.hellodoctormx.sdk.types

import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable
import java.time.LocalDateTime

@Serializable
data class Consultation(val id: String, @Contextual val scheduledStart: LocalDateTime, val status: String)