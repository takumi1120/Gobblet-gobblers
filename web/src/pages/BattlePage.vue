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
    <div class="page-inner">
      <h1>Gobblet Gobblers</h1>

      <BattleHeader
        class="battle-header"
        :player1-name="player1Name"
        :player2-name="player2Name"
        :player1-character-name="player1CharacterName"
        :player2-character-name="player2CharacterName"
        :player1-character-image="player1CharacterImage"
        :player2-character-image="player2CharacterImage"
      />

      <div
        class="turn-banner"
        :class="currentPlayer === 1 ? 'banner-p1' : 'banner-p2'"
      >
        {{ message }}
      </div>

      <div class="game-layout">
        <ReservePanel
          class="reserve-panel"
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
          class="battle-board"
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
          class="reserve-panel"
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

      <div class="bottom-layout">
        <BattleControls
          class="battle-controls"
          :playing="playing"
          @start-bgm="startBgm"
          @stop-bgm="stopBgm"
          @reset="handleReset"
          @go-home="goHome"
        />

        <BattleRules class="battle-rules" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.battle-page {
  min-height: 100vh;
  background:
    linear-gradient(rgba(15, 8, 4, 0.60), rgba(15, 8, 4, 0.72)),
    url("../assets/tavern-bg.png") center center / cover no-repeat;
  color: #ffe3ad;
}

.page-inner {
  width: min(100%, 1460px);
  min-height: 100vh;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 8px 18px 14px;
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 10px;
}

h1 {
  margin: 0;
  text-align: center;
  font-size: 28px;
  line-height: 1.05;
  font-weight: 900;
  color: #ffd27a;
  text-shadow:
    0 2px 10px rgba(0, 0, 0, 0.55),
    0 0 18px rgba(255, 170, 70, 0.22);
}

/* Header をコンパクト化 */
.battle-header :deep(.player-info-row) {
  gap: 16px;
  flex-wrap: nowrap;
}

.battle-header :deep(.player-info-card) {
  width: 210px;
  padding: 10px 12px;
  border-radius: 16px;
}

.battle-header :deep(.battle-character-image) {
  width: 78px;
  height: 78px;
  margin-bottom: 8px;
}

.battle-header :deep(.player-name) {
  margin: 0 0 4px;
  font-size: 15px;
}

.battle-header :deep(.character-name) {
  margin: 0;
  font-size: 12px;
  line-height: 1.2;
}

.turn-banner {
  max-width: 360px;
  margin: 0 auto;
  text-align: center;
  font-size: 20px;
  font-weight: 900;
  padding: 10px 16px;
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(4px);
}

.banner-p1 {
  background: linear-gradient(180deg, rgba(66, 110, 230, 0.55), rgba(31, 48, 112, 0.42));
  color: #e5efff;
}

.banner-p2 {
  background: linear-gradient(180deg, rgba(215, 76, 76, 0.55), rgba(108, 28, 28, 0.42));
  color: #ffe4e4;
}

.game-layout {
  display: grid;
  grid-template-columns: 250px minmax(480px, 1fr) 250px;
  gap: 18px;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.battle-board {
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 持ち駒パネルを少し締める */
.reserve-panel :deep(.side-panel) {
  padding: 14px 12px 16px;
  border-radius: 20px;
}

.reserve-panel :deep(.side-panel h2) {
  margin: 0 0 10px;
  font-size: 18px;
}

.reserve-panel :deep(.reserve-grid) {
  gap: 10px;
}

.reserve-panel :deep(.reserve-piece.piece-s) {
  min-height: 72px;
}

.reserve-panel :deep(.reserve-piece.piece-m) {
  min-height: 92px;
}

.reserve-panel :deep(.reserve-piece.piece-l) {
  min-height: 112px;
}

.reserve-panel :deep(.reserve-piece-inner.piece-s) {
  transform: scale(0.62);
}

.reserve-panel :deep(.reserve-piece-inner.piece-m) {
  transform: scale(0.74);
}

.reserve-panel :deep(.reserve-piece-inner.piece-l) {
  transform: scale(0.86);
}

.bottom-layout {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
}

.battle-controls {
  display: flex;
  align-items: center;
}

.battle-controls :deep(.buttons) {
  justify-content: flex-start;
  gap: 10px;
}

.battle-controls :deep(.buttons button) {
  min-width: 132px;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 12px;
}

.battle-rules {
  min-width: 0;
}

.battle-rules :deep(.rules) {
  max-width: none;
  width: 100%;
  padding: 12px 16px;
  border-radius: 16px;
}

.battle-rules :deep(.rules p) {
  margin: 0 0 8px;
  font-size: 16px;
}

.battle-rules :deep(.rules ul) {
  margin: 0;
  padding-left: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 18px;
}

.battle-rules :deep(.rules li) {
  margin-bottom: 0;
  line-height: 1.35;
  font-size: 13px;
}

/* 横幅が狭くなったら素直に縦並び */
@media (max-width: 1240px) {
  .page-inner {
    min-height: auto;
    padding: 12px 14px 18px;
    grid-template-rows: auto auto auto auto auto;
  }

  .battle-header :deep(.player-info-row) {
    flex-wrap: wrap;
  }

  .game-layout {
    grid-template-columns: 220px minmax(420px, 1fr) 220px;
    gap: 14px;
  }

  .bottom-layout {
    grid-template-columns: 1fr;
  }

  .battle-controls :deep(.buttons) {
    justify-content: center;
  }
}

@media (max-width: 980px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .battle-header :deep(.player-info-card) {
    width: 180px;
  }

  .battle-rules :deep(.rules ul) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-inner {
    padding: 10px 10px 16px;
    gap: 10px;
  }

  h1 {
    font-size: 24px;
  }

  .turn-banner {
    max-width: 300px;
    font-size: 17px;
    padding: 9px 12px;
  }
}
</style>