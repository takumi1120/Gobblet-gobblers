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
  router.push("/start");
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
:global(#app) {
  width: 100%;
  max-width: none;
  margin: 0;
  border-inline: 0;
}

.battle-page {
  --battle-page-top-padding: 0px;
  --battle-page-side-padding: clamp(16px, 1.6vw, 24px);
  --battle-page-bottom-padding: clamp(8px, 1.2vh, 10px);
  --battle-section-gap: clamp(1px, 0.3vh, 3px);
  --battle-title-size: clamp(17px, 1.8vh, 22px);
  --battle-header-gap: clamp(20px, 4vw, 56px);
  /*--battle-header-side-padding: clamp(20px, 8vw, 160px);*/
  --battle-header-card-width: clamp(168px, 13vw, 196px);
  --battle-header-card-padding-y: clamp(2px, 0.4vh, 4px);
  --battle-header-card-padding-x: clamp(10px, 0.9vw, 12px);
  --battle-header-image-size: clamp(50px, 5.7vh, 60px);
  --battle-player-name-size: clamp(11px, 1.3vh, 13px);
  --battle-character-name-size: clamp(9px, 1vh, 10px);
  --battle-banner-max-width: clamp(280px, 30vw, 340px);
  --battle-banner-font-size: clamp(15px, 1.85vh, 18px);
  --battle-banner-padding-y: clamp(3px, 0.45vh, 5px);
  --battle-banner-padding-x: clamp(12px, 1vw, 15px);
  --battle-banner-lift: clamp(84px, 10vh, 104px);
  --battle-side-panel-width: clamp(214px, 15vw, 248px);
  --battle-layout-gap: clamp(12px, 1.2vw, 20px);
  --battle-side-panel-padding-top: clamp(10px, 1.3vh, 12px);
  --battle-side-panel-padding-x: clamp(9px, 0.8vw, 11px);
  --battle-side-panel-padding-bottom: clamp(12px, 1.5vh, 14px);
  --battle-side-heading-size: clamp(14px, 1.8vh, 17px);
  --battle-side-piece-column-min: clamp(84px, 6.5vw, 104px);
  --battle-reserve-gap: clamp(6px, 0.9vh, 8px);
  --battle-reserve-height-s: clamp(56px, 7vh, 68px);
  --battle-reserve-height-m: clamp(68px, 8.8vh, 82px);
  --battle-reserve-height-l: clamp(82px, 10.6vh, 96px);
  --battle-reserve-scale-s: 0.58;
  --battle-reserve-scale-m: 0.68;
  --battle-reserve-scale-l: 0.8;
  --battle-board-size: clamp(600px, calc(100svh - 350px), 680px);
  --battle-board-lift: clamp(130px, 14vh, 160px);
  --battle-stack-size: clamp(20px, 2.8vh, 24px);
  --battle-stack-font-size: clamp(11px, 1.6vh, 13px);
  --battle-bottom-gap: clamp(10px, 1vw, 12px);
 /* --battle-bottom-width: min(100%, 860px);*/
  --battle-button-gap: clamp(6px, 0.8vh, 8px);
  --battle-button-min-width: clamp(104px, 9vw, 122px);
  --battle-button-padding-y: clamp(7px, 0.9vh, 9px);
  --battle-button-padding-x: clamp(10px, 0.9vw, 14px);
  --battle-button-font-size: clamp(12px, 1.4vh, 13px);
  --battle-rules-padding-y: clamp(8px, 1vh, 10px);
  --battle-rules-padding-x: clamp(12px, 1vw, 14px);
  --battle-rules-title-size: clamp(14px, 1.8vh, 15px);
  --battle-rules-item-size: clamp(11px, 1.35vh, 12px);
  --battle-rules-columns: 1;
  --battle-rules-column-gap: clamp(10px, 1.1vw, 14px);
  --battle-piece-size-s: clamp(42px, 5.7vh, 56px);
  --battle-piece-size-m: clamp(58px, 7.8vh, 76px);
  --battle-piece-size-l: clamp(72px, 9.9vh, 96px);
  min-height: 100vh;
  background:
    linear-gradient(rgba(15, 8, 4, 0.60), rgba(15, 8, 4, 0.72)),
    url("../assets/tavern-bg.png") center center / cover no-repeat;
  color: #ffe3ad;
}

.page-inner {
  width: min(100%, 1760px);
  min-height: 100vh;
  margin: 0 auto;
  box-sizing: border-box;
  padding:
    var(--battle-page-top-padding)
    var(--battle-page-side-padding)
    var(--battle-page-bottom-padding);
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: var(--battle-section-gap);
}

h1 {
  margin: 0;
  text-align: center;
  font-size: var(--battle-title-size);
  line-height: 1.05;
  font-weight: 900;
  color: #ffd27a;
  text-shadow:
    0 2px 10px rgba(0, 0, 0, 0.55),
    0 0 18px rgba(255, 170, 70, 0.22);
}

/* Header をコンパクト化 */
.battle-header :deep(.player-info-row) {
  width: 100%;
  gap: var(--battle-header-gap);
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: flex-start;
}

.battle-header :deep(.player-info-card) {
  width: var(--battle-header-card-width);
  padding: var(--battle-header-card-padding-y) var(--battle-header-card-padding-x);
  border-radius: 16px;
}

.battle-header :deep(.battle-character-image) {
  width: var(--battle-header-image-size);
  height: var(--battle-header-image-size);
  margin-bottom: 8px;
}

.battle-header :deep(.player-name) {
  margin: 0 0 4px;
  font-size: var(--battle-player-name-size);
}

.battle-header :deep(.character-name) {
  margin: 0;
  font-size: var(--battle-character-name-size);
  line-height: 1.2;
}

.turn-banner {
  max-width: var(--battle-banner-max-width);
  margin: 0 auto;
  text-align: center;
  font-size: var(--battle-banner-font-size);
  font-weight: 900;
  padding: var(--battle-banner-padding-y) var(--battle-banner-padding-x);
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(4px);
  transform: translateY(calc(var(--battle-banner-lift) * -1));
  position: relative;
  z-index: 6;
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
  grid-template-columns:
    var(--battle-side-panel-width)
    minmax(500px, 1fr)
    var(--battle-side-panel-width);
  gap: var(--battle-layout-gap);
  align-items: start;
  justify-content: center;
  min-height: 0;
}

.battle-board {
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: var(--battle-board-lift);
  position: relative;
  z-index: 1;
}

.battle-board :deep(.board-scene) {
  transform: translateY(calc(var(--battle-board-lift) * -1));
  transform-origin: top center;
}

/* 持ち駒パネルを少し締める */
.reserve-panel :deep(.side-panel) {
  padding:
    var(--battle-side-panel-padding-top)
    var(--battle-side-panel-padding-x)
    var(--battle-side-panel-padding-bottom);
  border-radius: 20px;
}

.reserve-panel :deep(.side-panel h2) {
  margin: 0 0 clamp(8px, 1vh, 10px);
  font-size: var(--battle-side-heading-size);
}

.reserve-panel :deep(.reserve-grid) {
  gap: var(--battle-reserve-gap);
}

.reserve-panel :deep(.reserve-piece.piece-s) {
  min-height: var(--battle-reserve-height-s);
}

.reserve-panel :deep(.reserve-piece.piece-m) {
  min-height: var(--battle-reserve-height-m);
}

.reserve-panel :deep(.reserve-piece.piece-l) {
  min-height: var(--battle-reserve-height-l);
}

.reserve-panel :deep(.reserve-piece-inner.piece-s) {
  transform: scale(var(--battle-reserve-scale-s));
}

.reserve-panel :deep(.reserve-piece-inner.piece-m) {
  transform: scale(var(--battle-reserve-scale-m));
}

.reserve-panel :deep(.reserve-piece-inner.piece-l) {
  transform: scale(var(--battle-reserve-scale-l));
}

.bottom-layout {
  width: 100%;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 340px; /* 左にボタン、右にルール */
  gap: var(--battle-bottom-gap);
  align-items: end;
  position: relative;
  z-index: 2;
}
.battle-controls {
  display: flex;
  align-items: flex-end;
   align-self: end;  
  justify-self: start;   /* ← 左寄せ */
  min-width: 0;
  
}

.battle-controls :deep(.buttons) {
  justify-content: flex-start;
  gap: var(--battle-button-gap);
}

.battle-controls :deep(.buttons button) {
  min-width: var(--battle-button-min-width);
  padding: var(--battle-button-padding-y) var(--battle-button-padding-x);
  font-size: var(--battle-button-font-size);
  border-radius: 12px;
}

.battle-rules {
  min-width: 0;
  
  
}

.battle-rules :deep(.rules) {
  max-width: none;
  width: 100%;
  padding: var(--battle-rules-padding-y) var(--battle-rules-padding-x);
  border-radius: 16px;
}

.battle-rules :deep(.rules p) {
  margin: 0 0 8px;
  font-size: var(--battle-rules-title-size);
}

.battle-rules :deep(.rules ul) {
  margin: 0;
  padding-left: 18px;
  display: grid;
  grid-template-columns: repeat(var(--battle-rules-columns), minmax(0, 1fr));
  gap: 4px var(--battle-rules-column-gap);
}

.battle-rules :deep(.rules li) {
  margin-bottom: 0;
  line-height: 1.35;
  font-size: var(--battle-rules-item-size);
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
    justify-content: center;
  }

  .game-layout {
    grid-template-columns: 220px minmax(420px, 1fr) 220px;
    gap: 14px;
  }

  .bottom-layout {
    width: min(100%, 680px);
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .battle-controls :deep(.buttons) {
    justify-content: center;
  }
}

@media (max-width: 980px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .bottom-layout {
    grid-template-columns: 1fr;
    width: 100%;
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

@media (min-width: 981px) {
  .battle-page {
    height: 100vh;
    overflow: hidden;
  }

  .page-inner {
    min-height: 100%;
    height: 100%;
  }
}
</style>
