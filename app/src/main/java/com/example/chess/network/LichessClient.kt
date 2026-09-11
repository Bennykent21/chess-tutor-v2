package com.example.chess.network

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.concurrent.TimeUnit

data class LichessStudyPreset(
  val id: String,
  val title: String,
  val author: String,
  val color: String,
  val description: String,
  val samplePgn: String
)

object LichessClient {
  private val httpClient = OkHttpClient.Builder()
    .connectTimeout(15, TimeUnit.SECONDS)
    .readTimeout(15, TimeUnit.SECONDS)
    .build()

  val curatedPresets = listOf(
    LichessStudyPreset(
      id = "italian-game-gm",
      title = "Italian Game: Classical Giuoco Piano",
      author = "Grandmaster Repertoire",
      color = "white",
      description = "Classical central dominance and rapid piece mobilization against 1...e5",
      samplePgn = """[Event "Italian Game: Giuoco Piano Main Line"]
[Site "Curated Repertoire"]
[Date "2024.01.01"]
[White "Repertoire"]
[Black "Defense"]
[Result "*"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Nbd2 a6 8. Bb3 Ba7 9. Re1 *"""
    ),
    LichessStudyPreset(
      id = "sicilian-najdorf-prep",
      title = "Sicilian Defense: Najdorf System",
      author = "Master Prep",
      color = "black",
      description = "Sharp, dynamic counter-attacking weapon against 1. e4",
      samplePgn = """[Event "Sicilian Defense: Najdorf Variation"]
[Site "Curated Repertoire"]
[Date "2024.01.01"]
[White "Open Sicilian"]
[Black "Repertoire"]
[Result "*"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O *"""
    ),
    LichessStudyPreset(
      id = "queens-gambit-declined",
      title = "Queen's Gambit Declined: Classical Solid",
      author = "World Championship Theory",
      color = "white",
      description = "Positional squeeze fighting for central supremacy with d4 and c4",
      samplePgn = """[Event "Queen's Gambit Declined: Main Line"]
[Site "Curated Repertoire"]
[Date "2024.01.01"]
[White "Repertoire"]
[Black "Defense"]
[Result "*"]

1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5 *"""
    ),
    LichessStudyPreset(
      id = "london-system-fortress",
      title = "London System: Universal Setup",
      author = "Club Player Gold",
      color = "white",
      description = "Bulletproof pawn pyramid with active dark-squared bishop outside the pawn chain",
      samplePgn = """[Event "London System: Classical Pyramid"]
[Site "Curated Repertoire"]
[Date "2024.01.01"]
[White "Repertoire"]
[Black "Defense"]
[Result "*"]

1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 e6 6. Ngf3 Bd6 7. Bg3 O-O 8. Bd3 *"""
    )
  )

  /**
   * Extracts clean 8-character study ID from URL or bare string.
   * e.g. "https://lichess.org/study/abcd1234" -> "abcd1234"
   */
  fun extractStudyId(input: String): String {
    val trimmed = input.trim()
    val pattern = Regex("""(?:lichess\.org/study/)?([a-zA-Z0-9]{8})""")
    val match = pattern.find(trimmed)
    return match?.groupValues?.get(1) ?: trimmed
  }

  /**
   * Fetches public study PGN directly from Lichess API.
   * Lichess serves PGN at: https://lichess.org/api/study/{studyId}.pgn
   */
  suspend fun fetchStudyPgn(studyIdOrUrl: String): Result<String> = withContext(Dispatchers.IO) {
    val studyId = extractStudyId(studyIdOrUrl)
    if (studyId.length != 8) {
      // Check if it's one of the curated presets
      val preset = curatedPresets.find { it.id == studyIdOrUrl }
      if (preset != null) {
        return@withContext Result.success(preset.samplePgn)
      }
      return@withContext Result.failure(IllegalArgumentException("Invalid Lichess Study ID: '$studyId'. Study IDs are 8 characters."))
    }

    val request = Request.Builder()
      .url("https://lichess.org/api/study/$studyId.pgn")
      .header("User-Agent", "ChessMasterCoachApp/1.0 (contact: user@chesscoach.app)")
      .build()

    try {
      httpClient.newCall(request).execute().use { response ->
        if (!response.isSuccessful) {
          return@withContext Result.failure(
            IOException("Lichess returned error code ${response.code}: ${response.message}")
          )
        }
        val pgnBody = response.body?.string().orEmpty()
        if (pgnBody.isBlank()) {
          return@withContext Result.failure(IOException("Empty PGN response from Lichess study"))
        }
        Result.success(pgnBody)
      }
    } catch (e: Exception) {
      Result.failure(e)
    }
  }
}
