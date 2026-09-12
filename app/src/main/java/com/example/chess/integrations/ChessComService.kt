package com.example.chess.integrations

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

class ChessComService(
  private val client: OkHttpClient = OkHttpClient()
) {
  private val moshi = Moshi.Builder().add(KotlinJsonAdapterFactory()).build()
  private val archivesAdapter = moshi.adapter(ChessComArchivesResponse::class.java)
  private val gamesAdapter = moshi.adapter(ChessComGamesResponse::class.java)

  suspend fun fetchRecentGames(username: String, limit: Int = 25): List<ChessComGame> =
    withContext(Dispatchers.IO) {
      val clean = username.trim().lowercase()
      require(clean.isNotEmpty()) { "Please provide a valid Chess.com username" }

      val archives = getJson(
        "https://api.chess.com/pub/player/$clean/games/archives",
        archivesAdapter
      ).archives

      if (archives.isEmpty()) return@withContext emptyList()

      getJson(archives.last(), gamesAdapter).games
        .asSequence()
        .filter { it.timeClass != "chess960" }
        .sortedByDescending { it.endTime ?: 0L }
        .take(limit)
        .toList()
    }

  private fun <T> getJson(
    url: String,
    adapter: com.squareup.moshi.JsonAdapter<T>
  ): T {
    val request = Request.Builder()
      .url(url)
      .header("Accept", "application/json")
      .build()

    client.newCall(request).execute().use { result ->
      if (!result.isSuccessful) {
        if (result.code == 404) {
          throw IOException("Chess.com player not found. Check the username.")
        }
        throw IOException("Chess.com error (" + result.code + ").")
      }
      val body = result.body?.string()
        ?: throw IOException("Chess.com returned an empty response.")
      return adapter.fromJson(body)
        ?: throw IOException("Chess.com returned invalid data.")
    }
  }
}
