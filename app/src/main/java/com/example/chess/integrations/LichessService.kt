package com.example.chess.integrations

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

class LichessService(
  private val client: OkHttpClient = OkHttpClient()
) {
  private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()

  fun extractStudyId(input: String): String? {
    val trimmed = input.trim()
    if (trimmed.matches(Regex("[A-Za-z0-9]{8}"))) return trimmed
    return Regex("lichess\\.org/study/([A-Za-z0-9]{8})")
      .find(trimmed)?.groupValues?.getOrNull(1)
  }

  suspend fun fetchStudyPgn(input: String): String = withContext(Dispatchers.IO) {
    val studyId = extractStudyId(input)
      ?: throw IllegalArgumentException("Enter a valid Lichess study URL or 8-character study ID.")
    val request = Request.Builder()
      .url("https://lichess.org/api/study/$studyId.pgn")
      .header("Accept", "application/x-chess-pgn")
      .build()
    client.newCall(request).execute().use { result ->
      if (!result.isSuccessful) {
        throw IOException("Lichess study returned HTTP " + result.code + ".")
      }
      result.body?.string()?.takeIf { it.isNotBlank() }
        ?: throw IOException("Lichess returned an empty study.")
    }
  }
}
