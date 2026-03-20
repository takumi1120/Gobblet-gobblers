<script setup lang="ts">
import PieceCone from "./PieceCone.vue";
import type { Cell, Piece, PieceSize, Player } from "../../types/battle.types";

defineProps<{
  board: Cell[][];
  winner: Player | null;
  boardPieceAt: (index: number) => Piece | null;
  pieceSizeClass: (size: PieceSize) => string;
  isSelectedBoardPiece: (row: number, col: number) => boolean;
  isPlayableCell: (row: number, col: number) => boolean;
  isWinningCell: (row: number, col: number) => boolean;
  playerImage: (owner: Player) => string;
}>();

const emit = defineEmits<{
  cellClick: [row: number, col: number];
}>();
</script>

<template>
  <section class="board-shell">
    <div class="board-scene">
      <div class="battle-board">
        <button
          v-for="(cell, index) in board.flat()"
          :key="index"
          class="cell"
          :class="{
            selected: isSelectedBoardPiece(Math.floor(index / 3), index % 3),
            playable: isPlayableCell(Math.floor(index / 3), index % 3),
            winning: isWinningCell(Math.floor(index / 3), index % 3),
          }"
          @click="emit('cellClick', Math.floor(index / 3), index % 3)"
        >
          <div class="cell-inner">
            <template v-if="boardPieceAt(index)">
              <div class="board-piece-anchor">
                <div
                  class="board-piece"
                  :class="pieceSizeClass(boardPieceAt(index)!.size)"
                >
                  <PieceCone
                    :size="boardPieceAt(index)!.size"
                    :owner="boardPieceAt(index)!.owner"
                    :image="playerImage(boardPieceAt(index)!.owner)"
                    :selected="isSelectedBoardPiece(Math.floor(index / 3), index % 3)"
                  />
                </div>
              </div>
            </template>

            <span class="stack-count" v-if="cell.length > 1">
              {{ cell.length }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board-shell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.board-scene {
  width: 100%;
  max-width: 560px;
  padding: 16px;
  background: linear-gradient(180deg, rgba(72, 47, 28, 0.96), rgba(42, 28, 17, 0.96));
  border: 1px solid rgba(214, 170, 93, 0.45);
  border-radius: 28px;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.2);
}

.battle-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 16px;
}

.cell {
  position: relative;
  aspect-ratio: 1 / 1;
  border: 0;
  border-radius: 22px;
  background:
    linear-gradient(145deg, rgba(244, 214, 167, 0.95), rgba(193, 145, 83, 0.95));
  box-shadow:
    inset 0 8px 18px rgba(255, 255, 255, 0.28),
    inset 0 -10px 18px rgba(73, 41, 12, 0.2),
    0 8px 18px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  padding: 0;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.cell:hover {
  transform: translateY(-2px);
}

.cell.playable {
  box-shadow:
    inset 0 8px 18px rgba(255, 255, 255, 0.28),
    inset 0 -10px 18px rgba(73, 41, 12, 0.2),
    0 0 0 3px rgba(103, 214, 255, 0.32),
    0 8px 18px rgba(0, 0, 0, 0.18);
}

.cell.selected {
  box-shadow:
    inset 0 8px 18px rgba(255, 255, 255, 0.28),
    inset 0 -10px 18px rgba(73, 41, 12, 0.2),
    0 0 0 3px rgba(255, 216, 107, 0.4),
    0 8px 18px rgba(0, 0, 0, 0.18);
}

.cell.winning {
  box-shadow:
    inset 0 8px 18px rgba(255, 255, 255, 0.28),
    inset 0 -10px 18px rgba(73, 41, 12, 0.2),
    0 0 0 4px rgba(89, 214, 118, 0.5),
    0 8px 18px rgba(0, 0, 0, 0.18);
}

.cell-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.board-piece-anchor {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-piece {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stack-count {
  position: absolute;
  right: 10px;
  bottom: 8px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(56, 34, 18, 0.82);
  color: #ffe2a8;
  font-size: 13px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.board-piece.piece-s {
  transform: scale(0.92);
}

.board-piece.piece-m {
  transform: scale(1);
}

.board-piece.piece-l {
  transform: scale(1.08);
}
</style>