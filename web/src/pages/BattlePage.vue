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
  min-height: 100vh;
  padding: 20px 20px 36px;
  background:
    radial-gradient(circle at top, rgba(255, 222, 170, 0.18), transparent 34%),
    linear-gradient(180deg, #f6efe7 0%, #efe3d4 100%);
  color: #25170d;
}

.battle-page > h1 {
  margin: 0 0 18px;
  text-align: center;
  font-size: 40px;
  font-weight: 900;
  color: #5b371c;
}

.turn-banner {
  max-width: 560px;
  margin: 18px auto 22px;
  text-align: center;
  font-size: 30px;
  font-weight: 900;
  padding: 14px 18px;
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}

.banner-p1 {
  background: linear-gradient(180deg, rgba(78, 131, 255, 0.18), rgba(78, 131, 255, 0.08));
  color: #1f4ca7;
}

.banner-p2 {
  background: linear-gradient(180deg, rgba(255, 92, 92, 0.18), rgba(255, 92, 92, 0.08));
  color: #b12626;
}

.game-layout {
  display: grid;
  grid-template-columns: 240px minmax(420px, 560px) 240px;
  gap: 22px;
  align-items: start;
  justify-content: center;
  margin-bottom: 24px;
}

@media (max-width: 1100px) {
  .game-layout {
    grid-template-columns: 1fr;
  }
}
</style>