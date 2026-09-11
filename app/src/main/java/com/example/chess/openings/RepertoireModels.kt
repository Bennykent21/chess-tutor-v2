package com.example.chess.openings

import com.example.chess.core.Move
import com.example.chess.core.PieceColor

data class RepertoireMoveStep(
  val plyIndex: Int,
  val moveNumber: Int,
  val isWhiteMove: Boolean,
  val san: String,
  val uci: String,
  val fenBefore: String,
  val fenAfter: String,
  val comment: String = ""
)

data class RepertoireLine(
  val id: String,
  val name: String,
  val eco: String,
  val side: PieceColor,
  val description: String,
  val moves: List<RepertoireMoveStep>,
  val masteryPct: Int = 0,
  val keyIdeas: List<String> = emptyList(),
  val createdAtMs: Long = System.currentTimeMillis()
)
