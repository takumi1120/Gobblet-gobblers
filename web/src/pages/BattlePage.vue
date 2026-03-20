<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import BattleHeader from "../components/battle/BattleHeader.vue";
import BattleBoard from "../components/battle/BattleBoard.vue";
import ReservePanel from "../components/battle/ReservePanel.vue";
import BattleControls from "../components/battle/BattleControls.vue";
import BattleRules from "../components/battle/BattleRules.vue";

import { useBattleBgm } from "../composables/useBattleBgm";
import { useBattleGame } from "../composables/useBattleGame";
import { useBattleResult } from "../composables/useBattleResult";

import type { PieceSize, Player } from "../types/battle.types";

const router = useRouter();
const route = useRoute();

const player1Name = computed(() => {
  const value = route.query.p1Name;
  return typeof value === "string" && value.trim() !== "" ? value : "Player 1";
});

const player2Name = computed(() => {
  const value = route.query.p2Name;
  return typeof value === "string" && value.trim() !== "" ? value : "Player 2";
});

const player1Id = computed(() => {
  const value = route.query.p1Id;
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
});

const player2Id = computed(() => {
  const value = route.query.p2Id;
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
});

const player1CharacterName = computed(() => {
  const value = route.query.p1CharacterName;
  return typeof value === "string" ? value : "";
});

const player2CharacterName = computed(() => {
  const value = route.query.p2CharacterName;
  return typeof value === "string" ? value : "";
});

const player1CharacterImage = computed(() => {
  const value = route.query.p1CharacterImage;
  return typeof value === "string" ? value : "";
});

const player2CharacterImage = computed(() => {
  const value = route.query.p2CharacterImage;
  return typeof value === "string" ? value : "";
});

function playerImage(owner: Player): string {
  return owner === 1
    ? player1CharacterImage.value
    : player2CharacterImage.value;
}

const { saveBattleResult, resetResultState } = useBattleResult({
  player1Id: player1Id.value,
  player2Id: player2Id.value,
});

const {
  board,
  reserveP1,
  reserveP2,
  currentPlayer,
  winner,
  message,
  selectReservePiece,
  handleCellClick,
  resetGame,
  isSelectedReservePiece,
  isSelectedBoardPiece,
  isWinningCell,
  isPlayableCell,
  reserveText,
  boardPieceAt,
} = useBattleGame({
  player1Name,
  player2Name,
  onWin: saveBattleResult,
});

const { playing, startBgm, stopBgm } = useBattleBgm();

function pieceSizeClass(size: PieceSize): string {
  if (size === 1) return "piece-s";
  if (size === 2) return "piece-m";
  return "piece-l";
}

function handleReset() {
  resetGame();
  resetResultState();
}

function goHome() {
  stopBgm();
  router.push("/");
}

onMounted(async () => {
  try {
    await startBgm();
  } catch {
    // 自動再生ブロック対策
  }
});

onBeforeUnmount(() => {
  stopBgm();
});
</script>

<template>
  <div class="battle-page">
    <h1>Gobblet Gobblers</h1>

    <BattleHeader
      :player1-name="player1Name"
      :player2-name="player2Name"
      :player1-character-name="player1CharacterName"
      :player2-character-name="player2CharacterName"
      :player1-character-image="player1CharacterImage"
      :player2-character-image="player2CharacterImage"
    />

    <div class="turn-banner" :class="currentPlayer === 1 ? 'banner-p1' : 'banner-p2'">
      {{ message }}
    </div>

    <div class="game-layout">
      <ReservePanel
        :title="player2Name"
        :pieces="reserveP2"
        :current-player="currentPlayer"
        :owner="2"
        :winner="winner"
        :piece-size-class="pieceSizeClass"
        :is-selected-reserve-piece="isSelectedReservePiece"
        :reserve-text="reserveText"
        :player-image="playerImage"
        @select="selectReservePiece"
      />

      <BattleBoard
        :board="board"
        :winner="winner"
        :board-piece-at="boardPieceAt"
        :piece-size-class="pieceSizeClass"
        :is-selected-board-piece="isSelectedBoardPiece"
        :is-playable-cell="isPlayableCell"
        :is-winning-cell="isWinningCell"
        :player-image="playerImage"
        @cell-click="handleCellClick"
      />

      <ReservePanel
        :title="player1Name"
        :pieces="reserveP1"
        :current-player="currentPlayer"
        :owner="1"
        :winner="winner"
        :piece-size-class="pieceSizeClass"
        :is-selected-reserve-piece="isSelectedReservePiece"
        :reserve-text="reserveText"
        :player-image="playerImage"
        @select="selectReservePiece"
      />
    </div>

    <BattleControls
      :playing="playing"
      @start-bgm="startBgm"
      @stop-bgm="stopBgm"
      @reset="handleReset"
      @go-home="goHome"
    />

    <BattleRules />
  </div>
</template>
<style scoped>
.battle-page {
  position: relative;
  min-height: 100vh;
  padding: 24px 20px 40px;
  box-sizing: border-box;
  overflow: hidden;
  background:
    url("../assets/tavern-bg.png") center center / cover no-repeat;
  color: #ffe3ad;
}

/* 背景を暗くしてUIを見やすくする */
.battle-page::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 14%, rgba(255, 199, 117, 0.18), transparent 24%),
    radial-gradient(circle at 20% 18%, rgba(255, 173, 92, 0.10), transparent 18%),
    radial-gradient(circle at 80% 18%, rgba(255, 173, 92, 0.10), transparent 18%),
    linear-gradient(
      180deg,
      rgba(18, 10, 6, 0.42) 0%,
      rgba(20, 11, 7, 0.62) 35%,
      rgba(18, 10, 6, 0.78) 70%,
      rgba(12, 7, 5, 0.88) 100%
    );
  z-index: 0;
}

/* 周辺を少し暗くして中央に視線を寄せる */
.battle-page::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.22) 100%);
  z-index: 0;
  pointer-events: none;
}

.battle-page > * {
  position: relative;
  z-index: 1;
}

.battle-page > h1 {
  margin: 0 0 20px;
  text-align: center;
  font-size: 44px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #ffd27a;
  text-shadow:
    0 0 4px #fff2b3,
    0 0 10px rgba(19, 16, 11, 0.95),
    0 0 22px rgba(255, 159, 28, 0.45),
    0 0 36px rgba(7, 6, 6, 0.95);
}

.turn-banner {
  max-width: 620px;
  margin: 18px auto 24px;
  text-align: center;
  font-size: 30px;
  font-weight: 900;
  padding: 14px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 214, 140, 0.28);
  backdrop-filter: blur(6px);
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 235, 200, 0.08);
}

.banner-p1 {
  background:
    linear-gradient(180deg, rgba(48, 77, 145, 0.78), rgba(20, 36, 78, 0.72));
  color: #d8e7ff;
}

.banner-p2 {
  background:
    linear-gradient(180deg, rgba(143, 45, 45, 0.80), rgba(92, 24, 24, 0.72));
  color: #ffe0e0;
}

.game-layout {
  display: grid;
  grid-template-columns: 240px minmax(420px, 560px) 240px;
  gap: 22px;
  align-items: start;
  justify-content: center;
  margin: 0 auto 24px;
  padding: 24px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(52, 31, 16, 0.42), rgba(23, 14, 8, 0.58));
  border: 1px solid rgba(255, 210, 130, 0.16);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.30),
    inset 0 1px 0 rgba(255, 234, 196, 0.06);
  backdrop-filter: blur(4px);
}

@media (max-width: 1100px) {
  .game-layout {
    grid-template-columns: 1fr;
    max-width: 760px;
    padding: 18px;
  }
}

@media (max-width: 640px) {
  .battle-page {
    padding: 16px 12px 28px;
  }

  .battle-page > h1 {
    font-size: 34px;
  }

  .turn-banner {
    font-size: 22px;
    padding: 12px 14px;
  }

  .game-layout {
    gap: 16px;
    border-radius: 20px;
  }
}
</style>