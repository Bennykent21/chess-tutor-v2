package com.example.chess.integrations

data class ChessComGame(
  val url: String? = null,
  val pgn: String? = null,
  val timeControl: String? = null,
  val endTime: Long? = null,
  val rated: Boolean? = null,
  val timeClass: String? = null,
  val white: Player? = null,
  val black: Player? = null,
  val fen: String? = null
) {
  data class Player(
    val username: String? = null,
    val rating: Int? = null,
    val result: String? = null
  )
}

data class ChessComGamesResponse(
  val games: List<ChessComGame> = emptyList()
)

data class ChessComArchivesResponse(
  val archives: List<String> = emptyList()
)
