package com.example.chess.openings

import com.example.chess.analysis.PgnParser
import com.example.chess.core.LegalMoveGenerator
import com.example.chess.core.PieceColor
import com.example.chess.core.Position
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

object RepertoireRepository {

  private val builtInRepertoires = listOf(
    createBuiltInLine(
      id = "rep-italian-game",
      name = "Italian Game: Classical Giuoco Piano",
      eco = "C50",
      side = PieceColor.WHITE,
      description = "Classical harmonic piece development pressuring Black's vulnerable f7 square, followed by c3 and d4 central strike.",
      pgnMoves = "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O O-O 7. Nbd2 a6 8. Bb3 Ba7",
      keyIdeas = listOf("Claim c4-f7 diagonal", "Support d4 break with c3", "Protect King with timely kingside castling")
    ),
    createBuiltInLine(
      id = "rep-sicilian-najdorf",
      name = "Sicilian Defense: Najdorf System",
      eco = "B90",
      side = PieceColor.BLACK,
      description = "The premier dynamic response to 1. e4. Black plays ...a6 to control b5 and sets up an explosive asymmetrical counterattack.",
      pgnMoves = "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O",
      keyIdeas = listOf("Control b5 square with ...a6", "Target White's e4 pawn and d-file", "Launch queenside pawn storm with ...b5")
    ),
    createBuiltInLine(
      id = "rep-queens-gambit",
      name = "Queen's Gambit: Classical Main Line",
      eco = "D37",
      side = PieceColor.WHITE,
      description = "Strategic positional mastery. White challenges Black's center immediately with 2. c4, seeking superior central space.",
      pgnMoves = "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5",
      keyIdeas = listOf("Deflect Black's d5 center pawn", "Occupy the semi-open c-file with Rc1", "Build lasting central pressure")
    ),
    createBuiltInLine(
      id = "rep-london-system",
      name = "London System: Solid Pyramid Setup",
      eco = "D02",
      side = PieceColor.WHITE,
      description = "Low-theory, rock-solid setup. White develops the dark-squared Bishop to f4 before locking the center with e3 and c3.",
      pgnMoves = "1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3 Nc6 5. Nd2 e6 6. Ngf3 Bd6 7. Bg3 O-O 8. Bd3",
      keyIdeas = listOf("Establish impenetrable pawn triangle", "Anchor Knight on e5 outpost", "Bishop actively placed outside pawn chain")
    )
  )

  private val _repertoiresFlow = MutableStateFlow<List<RepertoireLine>>(builtInRepertoires)
  val repertoiresFlow: StateFlow<List<RepertoireLine>> = _repertoiresFlow.asStateFlow()

  fun getAllRepertoires(): List<RepertoireLine> = _repertoiresFlow.value

  fun getRepertoireById(id: String): RepertoireLine? =
    _repertoiresFlow.value.find { it.id == id }

  fun addRepertoire(repertoire: RepertoireLine) {
    _repertoiresFlow.value = listOf(repertoire) + _repertoiresFlow.value.filter { it.id != repertoire.id }
  }

  fun deleteRepertoire(id: String) {
    _repertoiresFlow.value = _repertoiresFlow.value.filter { it.id != id }
  }

  fun updateMastery(id: String, deltaPct: Int) {
    _repertoiresFlow.value = _repertoiresFlow.value.map { line ->
      if (line.id == id) {
        val newPct = (line.masteryPct + deltaPct).coerceIn(0, 100)
        line.copy(masteryPct = newPct)
      } else {
        line
      }
    }
  }

  /**
   * Imports a PGN game or study chapter and transforms it into an interactive RepertoireLine.
   */
  fun importFromPgn(
    pgnText: String,
    preferredColor: PieceColor? = null,
    customTitle: String? = null
  ): Result<RepertoireLine> {
    return try {
      val parsedGame = PgnParser.parse(pgnText)
      if (parsedGame.moves.isEmpty()) {
        return Result.failure(IllegalArgumentException("PGN contains no readable moves."))
      }

      val detectedColor = preferredColor ?: PieceColor.WHITE
      val title = customTitle?.takeIf { it.isNotBlank() }
        ?: if (parsedGame.event.isNotBlank() && parsedGame.event != "Game") {
          parsedGame.event
        } else {
          "${parsedGame.white} vs ${parsedGame.black}"
        }

      var currentPos = Position.fromFen(Position.STARTING_FEN)
      val steps = mutableListOf<RepertoireMoveStep>()

      for ((index, pgnMove) in parsedGame.moves.withIndex()) {
        val fenBefore = currentPos.toFen()
        val nextPos = pgnMove.positionAfter
        val isWhite = pgnMove.color == PieceColor.WHITE

        steps.add(
          RepertoireMoveStep(
            plyIndex = index,
            moveNumber = pgnMove.moveNumber,
            isWhiteMove = isWhite,
            san = pgnMove.san,
            uci = pgnMove.move.uci,
            fenBefore = fenBefore,
            fenAfter = nextPos.toFen(),
            comment = if (index < 4) "Core opening development step" else "Key strategic transition"
          )
        )
        currentPos = nextPos
      }

      val newLine = RepertoireLine(
        id = "custom-${UUID.randomUUID().toString().take(8)}",
        name = title,
        eco = "A00",
        side = detectedColor,
        description = "Imported line featuring ${steps.size} moves. Practice candidate responses and maintain strategic discipline.",
        moves = steps,
        masteryPct = 15,
        keyIdeas = listOf("Accurate move order discipline", "Maintain central balance", "Anticipate opponent counters")
      )

      addRepertoire(newLine)
      Result.success(newLine)
    } catch (e: Exception) {
      Result.failure(e)
    }
  }

  private fun createBuiltInLine(
    id: String,
    name: String,
    eco: String,
    side: PieceColor,
    description: String,
    pgnMoves: String,
    keyIdeas: List<String>
  ): RepertoireLine {
    val parsed = PgnParser.parse(pgnMoves)
    var curPos = Position.fromFen(Position.STARTING_FEN)
    val steps = mutableListOf<RepertoireMoveStep>()

    for ((idx, m) in parsed.moves.withIndex()) {
      val fenBefore = curPos.toFen()
      val fenAfter = m.positionAfter.toFen()
      steps.add(
        RepertoireMoveStep(
          plyIndex = idx,
          moveNumber = m.moveNumber,
          isWhiteMove = m.color == PieceColor.WHITE,
          san = m.san,
          uci = m.move.uci,
          fenBefore = fenBefore,
          fenAfter = fenAfter
        )
      )
      curPos = m.positionAfter
    }

    return RepertoireLine(
      id = id,
      name = name,
      eco = eco,
      side = side,
      description = description,
      moves = steps,
      masteryPct = 30,
      keyIdeas = keyIdeas
    )
  }
}
