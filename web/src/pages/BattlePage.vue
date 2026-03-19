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

/* -----------------------
   受け取った情報
----------------------- */
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

/* -----------------------
   結果保存
----------------------- */
const {
  saveBattleResult,
  resetResultState,
} = useBattleResult({
  player1Id: player1Id.value,
  player2Id: player2Id.value,
});

/* -----------------------
   ゲーム
----------------------- */
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

/* -----------------------
   BGM
----------------------- */
const { playing, startBgm, stopBgm } = useBattleBgm();

/* -----------------------
   表示用
----------------------- */
function pieceSizeClass(size: PieceSize): string {
  if (size === 1) return "piece-s";
  if (size === 2) return "piece-m";
  return "piece-l";
}

function pieceOwnerClass(owner: Player): string {
  return owner === 1 ? "piece-p1" : "piece-p2";
}

function playerImage(owner: Player): string {
  return owner === 1 ? player1CharacterImage.value : player2CharacterImage.value;
}

/* -----------------------
   画面操作
----------------------- */
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
        :player-image="playerImage"
        :piece-size-class="pieceSizeClass"
        :piece-owner-class="pieceOwnerClass"
        :is-selected-reserve-piece="isSelectedReservePiece"
        :reserve-text="reserveText"
        @select="selectReservePiece"
      />

      <BattleBoard
        :board="board"
        :winner="winner"
        :board-piece-at="boardPieceAt"
        :player-image="playerImage"
        :piece-size-class="pieceSizeClass"
        :piece-owner-class="pieceOwnerClass"
        :is-selected-board-piece="isSelectedBoardPiece"
        :is-playable-cell="isPlayableCell"
        :is-winning-cell="isWinningCell"
        @cell-click="handleCellClick"
      />

      <ReservePanel
        :title="player1Name"
        :pieces="reserveP1"
        :current-player="currentPlayer"
        :owner="1"
        :winner="winner"
        :player-image="playerImage"
        :piece-size-class="pieceSizeClass"
        :piece-owner-class="pieceOwnerClass"
        :is-selected-reserve-piece="isSelectedReservePiece"
        :reserve-text="reserveText"
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
  min-height: 100vh;
  background:
    radial-gradient(rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.62)),
    url("../assets/tavern-bg.png") center center / cover no-repeat;
  color: #ffdc9a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 24px;
  box-sizing: border-box;
  font-family: system-ui;
}

h1 {
  margin: 0;
  font-size: 42px;
  letter-spacing: 1px;
  text-shadow:
    0 0 4px #fff2b3,
    0 0 8px #13100b,
    0 0 16px #ff9f1c,
    0 0 28px #070606;
}

.turn-banner {
  min-width: 260px;
  padding: 12px 18px;
  border-radius: 999px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  border: 1px solid rgba(255, 220, 154, 0.38);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.28),
    inset 0 0 12px rgba(255, 255, 255, 0.04);
}

.banner-p1 {
  background: linear-gradient(180deg, rgba(26, 90, 40, 0.84), rgba(15, 50, 25, 0.92));
}

.banner-p2 {
  background: linear-gradient(180deg, rgba(125, 30, 30, 0.84), rgba(60, 12, 12, 0.92));
}

.game-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .game-layout {
    flex-direction: column;
  }
}
</style>