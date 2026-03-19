<script setup lang="ts">
import PieceCone from "./PieceCone.vue";
import type { Cell, Piece, PieceSize, Player } from "../../types/battle.types";

defineProps<{
  board: Cell[][];
  winner: Player | null;
  boardPieceAt: (index: number) => Piece | null;
  playerImage: (owner: Player) => string;
  pieceSizeClass: (size: PieceSize) => string;
  pieceOwnerClass: (owner: Player) => string;
  isSelectedBoardPiece: (row: number, col: number) => boolean;
  isPlayableCell: (row: number, col: number) => boolean;
  isWinningCell: (row: number, col: number) => boolean;
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
                  :class="[
                    pieceOwnerClass(boardPieceAt(index)!.owner),
                    pieceSizeClass(boardPieceAt(index)!.size)
                  ]"
                >
                  <PieceCone
                    :unique-key="`board-${index}-${boardPieceAt(index)!.id}`"
                    :owner="boardPieceAt(index)!.owner"
                    :size="boardPieceAt(index)!.size"
                    :image="playerImage(boardPieceAt(index)!.owner)"
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
  position: relative;
  padding: 18px 20px 34px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(18, 10, 5, 0.48), rgba(9, 5, 3, 0.62));
  box-shadow:
    0 16px 30px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 228, 176, 0.05);
}

.board-scene {
  position: relative;
  width: 430px;
  height: 430px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1400px;
}

.board-scene::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: 310px;
  height: 90px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.38);
  filter: blur(20px);
  z-index: 0;
}

.battle-board {
  position: relative;
  z-index: 1;
  width: 390px;
  height: 390px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 14px;
  border-radius: 24px;
  border: 1px solid rgba(255, 214, 146, 0.34);
  background: linear-gradient(145deg, rgba(132, 87, 47, 0.98), rgba(84, 51, 24, 0.99));
  box-sizing: border-box;
  transform-style: preserve-3d;
  transform: rotateX(56deg) rotateZ(45deg);
  box-shadow:
    0 24px 34px rgba(0, 0, 0, 0.38),
    inset 0 2px 0 rgba(255, 234, 193, 0.16),
    inset 0 -5px 0 rgba(58, 33, 15, 0.52);
}

.battle-board::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(68, 40, 18, 0.96), rgba(45, 25, 12, 1));
  transform: translateZ(-18px);
  z-index: -1;
  box-shadow: 0 16px 24px rgba(0, 0, 0, 0.3);
}

.battle-board::after {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 18px;
  pointer-events: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 240, 205, 0.08),
    inset 0 -1px 0 rgba(40, 22, 9, 0.35);
}

.cell {
  position: relative;
  overflow: visible;
  border: 1px solid rgba(255, 226, 170, 0.12);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(112, 73, 37, 0.97), rgba(73, 45, 22, 0.99));
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
  box-shadow:
    inset 0 2px 3px rgba(255, 237, 202, 0.08),
    inset 0 -6px 9px rgba(0, 0, 0, 0.24),
    0 2px 4px rgba(0, 0, 0, 0.16);
}

.cell::before {
  content: "";
  position: absolute;
  inset: 7px;
  border-radius: 14px;
  box-shadow:
    inset 0 4px 7px rgba(0, 0, 0, 0.2),
    inset 0 -1px 0 rgba(255, 233, 192, 0.05);
}

.cell:hover {
  transform: translateZ(8px);
}

.cell.playable {
  box-shadow:
    inset 0 0 0 2px rgba(255, 220, 120, 0.22),
    inset 0 2px 3px rgba(255, 237, 202, 0.08),
    inset 0 -6px 9px rgba(0, 0, 0, 0.24),
    0 0 14px rgba(255, 196, 76, 0.12);
}

.cell.selected {
  box-shadow:
    inset 0 0 0 3px rgba(255, 235, 180, 0.56),
    0 0 0 1px rgba(255, 232, 180, 0.28),
    0 0 20px rgba(255, 210, 110, 0.22);
}

.cell.winning {
  animation: glowWin 0.9s infinite alternate;
}

@keyframes glowWin {
  from {
    box-shadow:
      inset 0 0 0 2px rgba(255, 223, 140, 0.35),
      0 0 10px rgba(255, 208, 110, 0.18);
  }
  to {
    box-shadow:
      inset 0 0 0 3px rgba(255, 242, 186, 0.72),
      0 0 22px rgba(255, 220, 130, 0.42);
  }
}

.cell-inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
  perspective: 1200px;
}

.board-piece-anchor {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  transform: translate(-50%, -50%) translateZ(22px);
}

.board-piece {
  width: 82px;
  height: 112px;
  transform:
    translate(-50%, -62%)
    rotateZ(-45deg)
    scale(1);
  transition:
    transform 0.16s ease,
    filter 0.16s ease;
  filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.28));
}

.cell:hover .board-piece {
  transform:
    translate(-50%, -65%)
    rotateZ(-45deg)
    scale(1.04);
}

.cell.selected .board-piece {
  transform:
    translate(-50%, -67%)
    rotateZ(-45deg)
    scale(1.08);
}

.cell.winning .board-piece {
  filter:
    drop-shadow(0 0 10px rgba(255, 220, 120, 0.45))
    drop-shadow(0 10px 10px rgba(0, 0, 0, 0.28));
}

.piece-s.board-piece {
  width: 64px;
  height: 88px;
}

.piece-m.board-piece {
  width: 82px;
  height: 112px;
}

.piece-l.board-piece {
  width: 98px;
  height: 132px;
}

.stack-count {
  position: absolute;
  right: 8px;
  bottom: 6px;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(20, 10, 5, 0.92);
  color: #ffe9b8;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 220, 150, 0.28);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
  transform: translateZ(38px) rotateZ(-45deg) rotateX(-18deg);
}
</style>