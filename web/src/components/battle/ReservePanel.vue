<script setup lang="ts">
import PieceCone from "./PieceCone.vue";
import type { Piece, PieceSize, Player } from "../../types/battle.types";

defineProps<{
  title: string;
  pieces: Piece[];
  currentPlayer: Player;
  owner: Player;
  winner: Player | null;
  playerImage: (owner: Player) => string;
  pieceSizeClass: (size: PieceSize) => string;
  pieceOwnerClass: (owner: Player) => string;
  isSelectedReservePiece: (pieceId: string) => boolean;
  reserveText: (piece: Piece) => string;
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
          pieceOwnerClass(piece.owner),
          pieceSizeClass(piece.size),
          { selected: currentPlayer === owner && isSelectedReservePiece(piece.id) }
        ]"
        :disabled="currentPlayer !== owner || winner !== null"
        @click="emit('select', piece.id)"
        :title="reserveText(piece)"
      >
        <PieceCone
  :unique-key="piece.id"
  :owner="piece.owner"
  :size="piece.size"
  :image="playerImage(piece.owner)"
/>
      </button>
    </div>
  </section>
</template>

<style scoped>
.side-panel {
  width: 200px;
  min-height: 360px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 204, 112, 0.36);
  background:
    linear-gradient(180deg, rgba(42, 25, 12, 0.88), rgba(25, 15, 8, 0.82));
  box-shadow:
    0 12px 26px rgba(0, 0, 0, 0.36),
    inset 0 1px 0 rgba(255, 228, 176, 0.06),
    0 0 16px rgba(255, 180, 80, 0.08);
  box-sizing: border-box;
}

.side-panel h2 {
  margin: 0 0 14px;
  text-align: center;
  font-size: 22px;
}

.reserve-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  justify-items: center;
}

.reserve-piece {
  border: none;
  background: transparent;
  padding: 0;
  overflow: visible;
  width: 88px;
  height: 132px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease;
}

.reserve-piece:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.04);
}

.reserve-piece:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.reserve-piece.selected {
  transform: translateY(-6px) scale(1.06);
}

.piece-s.reserve-piece {
  width: 72px;
  height: 112px;
}

.piece-m.reserve-piece {
  width: 88px;
  height: 132px;
}

.piece-l.reserve-piece {
  width: 104px;
  height: 152px;
}

@media (max-width: 960px) {
  .side-panel {
    width: 100%;
    max-width: 390px;
    min-height: auto;
  }

  .piece-s.reserve-piece {
    width: 66px;
    height: 102px;
  }

  .piece-m.reserve-piece {
    width: 78px;
    height: 118px;
  }

  .piece-l.reserve-piece {
    width: 92px;
    height: 136px;
  }
}
</style>