<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import BattleHeader from "../components/battle/BattleHeader.vue";
import BattleBoard from "../components/battle/BattleBoard.vue";
import ReservePanel from "../components/battle/ReservePanel.vue";
import BattleControls from "../components/battle/BattleControls.vue";
import BattleRules from "../components/battle/BattleRules.vue";

import { useBattleBgm } from "../composables/useBattleBgm";
import { useOnlineBattleGame } from "../composables/useOnlineBattleGame";

import type { PieceSize, Player } from "../types/battle.types";

const router = useRouter();
const route = useRoute();

const roomId =
  typeof route.params.roomId === "string" ? route.params.roomId.toUpperCase() : "";

const localPlayer: Player = route.query.player === "2" ? 2 : 1;

const {
  loading,
  error,
  board,
  reserveP1,
  reserveP2,
  currentPlayer,
  winner,
  message,
  player1Name,
  player2Name,
  player1CharacterName,
  player2CharacterName,
  player1CharacterImage,
  player2CharacterImage,
  waitingForOpponent,
  isMyTurn,
  playerImage,
  selectReservePiece,
  handleCellClick,
  resetRoom,
  isSelectedReservePiece,
  isSelectedBoardPiece,
  isWinningCell,
  isPlayableCell,
  reserveText,
  boardPieceAt,
} = useOnlineBattleGame({
  roomId,
  localPlayer,
});

const { playing, startBgm, stopBgm } = useBattleBgm();

const statusText = computed(() => {
  if (waitingForOpponent.value) return "対戦相手の参加待ち";
  if (winner.value) return "対戦終了";
  return isMyTurn.value ? "あなたの手番" : "相手の手番";
});

function pieceSizeClass(size: PieceSize): string {
  if (size === 1) return "piece-s";
  if (size === 2) return "piece-m";
  return "piece-l";
}

async function copyRoomId() {
  try {
    await navigator.clipboard.writeText(roomId);
    alert(`ルームIDをコピーしました: ${roomId}`);
  } catch {
    alert(`ルームID: ${roomId}`);
  }
}

function goLobby() {
  stopBgm();
  router.push("/online");
}

function handleReset() {
  void resetRoom();
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
  <div class="online-battle-page">
    <div class="page-inner">
      <h1>Gobblet Gobblers Online</h1>

      <div class="room-toolbar">
        <span class="room-chip">ルームID: {{ roomId }}</span>
        <span class="room-chip">あなた: P{{ localPlayer }}</span>
        <span class="room-chip" :class="{ mine: isMyTurn }">{{ statusText }}</span>
        <button class="room-copy-button" @click="copyRoomId">ルームIDをコピー</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="loading" class="loading">ルーム情報を取得中...</p>

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

      <div v-if="waitingForOpponent" class="waiting-box">
        いまは対戦相手の参加待ちです。<br />
        ルームID <strong>{{ roomId }}</strong> を相手に共有してください。
      </div>

      <div class="game-layout">
        <ReservePanel
          class="reserve-panel"
          :title="player2Name"
          :pieces="reserveP2"
          :current-player="currentPlayer"
          :owner="2"
          :winner="winner"
          :panel-enabled="localPlayer === 2"
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
          :panel-enabled="localPlayer === 1"
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
          @go-home="goLobby"
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

.online-battle-page {
  --battle-page-side-padding: clamp(16px, 1.6vw, 24px);
  --battle-page-bottom-padding: clamp(8px, 1.2vh, 10px);
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
  --battle-board-size: clamp(600px, calc(100svh - 360px), 680px);
  --battle-stack-size: clamp(20px, 2.8vh, 24px);
  --battle-stack-font-size: clamp(11px, 1.6vh, 13px);
  --battle-piece-size-s: 56px;
  --battle-piece-size-m: 76px;
  --battle-piece-size-l: 96px;

  min-height: 100vh;
  padding:
    12px
    var(--battle-page-side-padding)
    var(--battle-page-bottom-padding);
  background:
    radial-gradient(circle at top, rgba(120, 77, 35, 0.28), transparent 34%),
    linear-gradient(180deg, #23150d 0%, #171008 100%);
}

.page-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

h1 {
  margin: 0;
  color: #ffd48a;
  font-size: clamp(22px, 2.2vw, 32px);
}

.room-toolbar {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.room-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(56, 34, 18, 0.82);
  border: 1px solid rgba(255, 204, 112, 0.25);
  color: #ffe2a8;
  font-weight: 700;
}

.room-chip.mine {
  border-color: rgba(105, 214, 255, 0.55);
  box-shadow: 0 0 14px rgba(105, 214, 255, 0.14);
}

.room-copy-button {
  padding: 10px 14px;
  border: 1px solid rgba(255, 204, 112, 0.5);
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(58, 34, 14, 0.88), rgba(34, 20, 9, 0.82));
  color: #ffdc9a;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.loading,
.error,
.waiting-box {
  width: 100%;
  max-width: 1200px;
  text-align: center;
  border-radius: 16px;
  padding: 12px;
}

.loading {
  color: #ffe2a8;
}

.error {
  color: #ffb4b4;
  background: rgba(70, 14, 14, 0.35);
  border: 1px solid rgba(255, 140, 140, 0.2);
}

.waiting-box {
  color: #ffe2a8;
  background: rgba(63, 45, 23, 0.72);
  border: 1px solid rgba(255, 204, 112, 0.22);
}

.turn-banner {
  min-width: min(520px, 90%);
  text-align: center;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 800;
  color: #fff5dc;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.22);
}

.banner-p1 {
  background: linear-gradient(180deg, rgba(43, 83, 146, 0.95), rgba(26, 56, 108, 0.95));
}

.banner-p2 {
  background: linear-gradient(180deg, rgba(150, 56, 54, 0.95), rgba(106, 33, 32, 0.95));
}

.game-layout {
  width: 100%;
  max-width: 1400px;
  display: grid;
  grid-template-columns:
    minmax(220px, var(--battle-side-panel-width))
    minmax(420px, 1fr)
    minmax(220px, var(--battle-side-panel-width));
  gap: var(--battle-layout-gap);
  align-items: center;
}

.battle-board {
  justify-self: center;
}

.bottom-layout {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  gap: 12px;
  align-items: start;
}

@media (max-width: 1180px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .bottom-layout {
    grid-template-columns: 1fr;
  }

  .reserve-panel {
    max-width: 380px;
    width: 100%;
    justify-self: center;
  }
}
</style>