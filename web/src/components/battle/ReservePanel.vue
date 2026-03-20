<script setup lang="ts">
import PieceCone from "./PieceCone.vue";
import type { Piece, PieceSize, Player } from "../../types/battle.types";

defineProps<{
  title: string;
  pieces: Piece[];
  currentPlayer: Player;
  owner: Player;
  winner: Player | null;
  pieceSizeClass: (size: PieceSize) => string;
  isSelectedReservePiece: (pieceId: string) => boolean;
  reserveText: (piece: Piece) => string;
  playerImage: (owner: Player) => string;
}>();

const emit = defineEmits<{
  select: [pieceId: string];
}>();
</script>

<template>
  <section class="side-panel">
    <h2>{{ title }}</h2>

    <div class="reserve-grid">
      <button
        v-for="piece in pieces"
        :key="piece.id"
        class="reserve-piece"
        :class="[
          pieceSizeClass(piece.size),
          { selected: currentPlayer === owner && isSelectedReservePiece(piece.id) }
        ]"
        :disabled="currentPlayer !== owner || winner !== null"
        @click="emit('select', piece.id)"
        :title="reserveText(piece)"
      >
        <div class="reserve-piece-inner" :class="pieceSizeClass(piece.size)">
          <PieceCone
            :size="piece.size"
            :owner="piece.owner"
            :image="playerImage(piece.owner)"
            placement="reserve"
            :selected="currentPlayer === owner && isSelectedReservePiece(piece.id)"
          />
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.side-panel {
  background: linear-gradient(180deg, rgba(66, 45, 26, 0.95), rgba(40, 27, 16, 0.95));
  border: 1px solid rgba(214, 170, 93, 0.45);
  border-radius: 22px;
  padding: 18px 16px 20px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
}

.side-panel h2 {
  margin: 0 0 14px;
  text-align: center;
  color: #ffd48a;
  font-size: 28px;
  font-weight: 800;
}

.reserve-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(88px, 1fr));
  gap: 12px;
}

.reserve-piece {
  border: 1px solid rgba(255, 221, 160, 0.22);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.reserve-piece:hover:enabled {
  transform: translateY(-2px);
  border-color: rgba(255, 221, 160, 0.5);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
}

.reserve-piece:disabled {
  cursor: default;
  opacity: 0.72;
}

.reserve-piece.selected {
  border-color: #ffd86b;
  box-shadow: 0 0 0 2px rgba(255, 216, 107, 0.25);
}

.reserve-piece-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
}

/* 持ち駒だけ縮尺を分ける */
.reserve-piece-inner.piece-s {
  transform: scale(0.72);
}

.reserve-piece-inner.piece-m {
  transform: scale(0.84);
}

.reserve-piece-inner.piece-l {
  transform: scale(0.96);
}

/* マス側の高さも持ち駒専用で調整 */
.reserve-piece.piece-s {
  min-height: 88px;
}

.reserve-piece.piece-m {
  min-height: 104px;
}

.reserve-piece.piece-l {
  min-height: 120px;
}
</style>