<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

/* -----------------------
   ルートからプレイヤー名取得
----------------------- */
const player1Name = computed(() => {
  const name = route.query.p1Name;
  return typeof name === "string" && name.trim() !== "" ? name : "Player 1";
});

const player2Name = computed(() => {
  const name = route.query.p2Name;
  return typeof name === "string" && name.trim() !== "" ? name : "Player 2";
});

/* -----------------------
   BGM
----------------------- */
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let nextLoopTimeout: number | null = null;

const playing = ref(false);

const melody = [
  { freq: 329.63, duration: 0.5 },
  { freq: 392.0, duration: 0.5 },
  { freq: 493.88, duration: 0.5 },
  { freq: 440.0, duration: 0.5 },
  { freq: 392.0, duration: 0.5 },
  { freq: 369.99, duration: 0.5 },
  { freq: 329.63, duration: 0.5 },
  { freq: 293.66, duration: 0.5 },
  { freq: 329.63, duration: 0.5 },
  { freq: 392.0, duration: 0.5 },
  { freq: 493.88, duration: 0.5 },
  { freq: 587.33, duration: 0.5 },
  { freq: 493.88, duration: 0.5 },
  { freq: 440.0, duration: 0.5 },
  { freq: 392.0, duration: 0.5 },
  { freq: 329.63, duration: 1.0 },
];

const bassLine = [
  { freq: 164.81, duration: 2.0 },
  { freq: 130.81, duration: 2.0 },
  { freq: 110.0, duration: 2.0 },
  { freq: 123.47, duration: 2.0 },
];

function createAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.12;
    masterGain.connect(audioContext.destination);
  }
}

function playTone(
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "triangle",
  volume = 0.2
) {
  if (!audioContext || !masterGain) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function scheduleLoop() {
  if (!audioContext || !isPlaying) return;

  const now = audioContext.currentTime + 0.05;

  let melodyTime = now;
  for (const note of melody) {
    playTone(note.freq, melodyTime, note.duration * 0.9, "triangle", 0.08);
    melodyTime += note.duration;
  }

  let bassTime = now;
  for (const note of bassLine) {
    playTone(note.freq, bassTime, note.duration * 0.95, "sine", 0.05);
    bassTime += note.duration;
  }

  nextLoopTimeout = window.setTimeout(() => {
    scheduleLoop();
  }, 8000);
}

async function startBgm() {
  createAudioContext();

  if (!audioContext) return;

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  if (isPlaying) return;

  isPlaying = true;
  playing.value = true;
  scheduleLoop();
}

function stopBgm() {
  isPlaying = false;
  playing.value = false;

  if (nextLoopTimeout !== null) {
    clearTimeout(nextLoopTimeout);
    nextLoopTimeout = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
    masterGain = null;
  }
}

/* -----------------------
   Gobblet Gobblers
----------------------- */
type Player = 1 | 2;
type PieceSize = 1 | 2 | 3;

type Piece = {
  id: string;
  owner: Player;
  size: PieceSize;
};

type Cell = Piece[];

type ReserveSource = {
  type: "reserve";
  pieceId: string;
};

type BoardSource = {
  type: "board";
  row: number;
  col: number;
  pieceId: string;
};

type SelectedSource = ReserveSource | BoardSource | null;
type Line = [number, number][];

const SIZE_LABEL: Record<PieceSize, string> = {
  1: "S",
  2: "M",
  3: "L",
};

const WIN_LINES: Line[] = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
];

function createPlayerPieces(owner: Player): Piece[] {
  return [
    { id: `P${owner}-S1`, owner, size: 1 },
    { id: `P${owner}-S2`, owner, size: 1 },
    { id: `P${owner}-M1`, owner, size: 2 },
    { id: `P${owner}-M2`, owner, size: 2 },
    { id: `P${owner}-L1`, owner, size: 3 },
    { id: `P${owner}-L2`, owner, size: 3 },
  ];
}

function createEmptyBoard(): Cell[][] {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => [])
  );
}

const board = ref<Cell[][]>(createEmptyBoard());
const reserveP1 = ref<Piece[]>(createPlayerPieces(1));
const reserveP2 = ref<Piece[]>(createPlayerPieces(2));

const currentPlayer = ref<Player>(1);
const winner = ref<Player | null>(null);
const selectedSource = ref<SelectedSource>(null);
const winningLine = ref<Line | null>(null);
const message = ref(`${player1Name.value} の手番です`);

const draggedPieceId = ref<string | null>(null);
const dragOverCell = ref<{ row: number; col: number } | null>(null);
const dragActive = ref(false);

function playerDisplayName(player: Player): string {
  return player === 1 ? player1Name.value : player2Name.value;
}

function getTopPiece(cell: Cell): Piece | null {
  if (cell.length === 0) return null;
  return cell[cell.length - 1];
}

function visibleOwner(row: number, col: number): Player | null {
  const top = getTopPiece(board.value[row][col]);
  return top ? top.owner : null;
}

function canPlaceOnCell(piece: Piece, row: number, col: number): boolean {
  const top = getTopPiece(board.value[row][col]);
  if (!top) return true;
  return piece.size > top.size;
}

function currentReserveList(): Piece[] {
  return currentPlayer.value === 1 ? reserveP1.value : reserveP2.value;
}

function getSelectedPiece(): Piece | null {
  if (!selectedSource.value) return null;

  if (selectedSource.value.type === "reserve") {
    return (
      currentReserveList().find((p) => p.id === selectedSource.value?.pieceId) ?? null
    );
  }

  const { row, col, pieceId } = selectedSource.value;
  const top = getTopPiece(board.value[row][col]);

  if (!top) return null;
  if (top.id !== pieceId) return null;

  return top;
}

const selectedPiece = computed(() => getSelectedPiece());

function selectReservePiece(pieceId: string) {
  if (winner.value) return;
  if (currentPlayer.value === 1 && !reserveP1.value.some((p) => p.id === pieceId)) return;
  if (currentPlayer.value === 2 && !reserveP2.value.some((p) => p.id === pieceId)) return;

  selectedSource.value = { type: "reserve", pieceId };

  const piece = getSelectedPiece();
  if (!piece) return;

  message.value = `${playerDisplayName(currentPlayer.value)}：${SIZE_LABEL[piece.size]} を置くマスを選んでください`;
}

function handleCellClick(row: number, col: number) {
  if (winner.value) return;

  const cell = board.value[row][col];
  const top = getTopPiece(cell);
  const piece = getSelectedPiece();

  if (!piece) {
    if (top && top.owner === currentPlayer.value) {
      selectedSource.value = {
        type: "board",
        row,
        col,
        pieceId: top.id,
      };
      message.value = `${playerDisplayName(currentPlayer.value)}：${SIZE_LABEL[top.size]} を移動する先を選んでください`;
      return;
    }

    message.value = "自分の駒を選んでください";
    return;
  }

  if (
    selectedSource.value?.type === "board" &&
    selectedSource.value.row === row &&
    selectedSource.value.col === col
  ) {
    selectedSource.value = null;
    message.value = `${playerDisplayName(currentPlayer.value)} の手番です`;
    return;
  }

  if (!canPlaceOnCell(piece, row, col)) {
    message.value = "そのマスには置けません";
    return;
  }

  moveSelectedPieceTo(row, col);
}

function moveSelectedPieceTo(row: number, col: number) {
  const piece = getSelectedPiece();
  if (!piece || !selectedSource.value) return;

  if (selectedSource.value.type === "reserve") {
    const list = currentReserveList();
    const index = list.findIndex((p) => p.id === piece.id);
    if (index === -1) return;
    list.splice(index, 1);
    board.value[row][col].push(piece);
  } else {
    const fromCell = board.value[selectedSource.value.row][selectedSource.value.col];
    const top = getTopPiece(fromCell);

    if (!top || top.id !== piece.id) {
      selectedSource.value = null;
      message.value = "その駒は動かせません";
      return;
    }

    fromCell.pop();
    board.value[row][col].push(piece);
  }

  selectedSource.value = null;
  draggedPieceId.value = null;
  dragOverCell.value = null;
  dragActive.value = false;

  const result = checkWinner();
  if (result.winner) {
    winner.value = result.winner;
    winningLine.value = result.line;
    message.value = `${playerDisplayName(result.winner)} の勝ち！`;
    return;
  }

  currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
  message.value = `${playerDisplayName(currentPlayer.value)} の手番です`;
}

function checkWinner(): { winner: Player | null; line: Line | null } {
  for (const line of WIN_LINES) {
    const owners = line.map(([r, c]) => visibleOwner(r, c));
    if (owners[0] && owners.every((owner) => owner === owners[0])) {
      return {
        winner: owners[0],
        line,
      };
    }
  }

  return {
    winner: null,
    line: null,
  };
}

function isSelectedReservePiece(pieceId: string): boolean {
  return (
    selectedSource.value?.type === "reserve" &&
    selectedSource.value.pieceId === pieceId
  );
}

function isSelectedBoardPiece(row: number, col: number): boolean {
  return (
    selectedSource.value?.type === "board" &&
    selectedSource.value.row === row &&
    selectedSource.value.col === col
  );
}

function isWinningCell(row: number, col: number): boolean {
  if (!winningLine.value) return false;
  return winningLine.value.some(([r, c]) => r === row && c === col);
}

function isPlayableCell(row: number, col: number): boolean {
  const piece = selectedPiece.value;
  if (!piece || winner.value) return false;

  if (
    selectedSource.value?.type === "board" &&
    selectedSource.value.row === row &&
    selectedSource.value.col === col
  ) {
    return false;
  }

  return canPlaceOnCell(piece, row, col);
}

function pieceLabel(piece: Piece): string {
  return SIZE_LABEL[piece.size];
}

function reserveText(piece: Piece): string {
  return `${playerDisplayName(piece.owner)} ${SIZE_LABEL[piece.size]}`;
}

function pieceSizeClass(size: PieceSize): string {
  if (size === 1) return "piece-s";
  if (size === 2) return "piece-m";
  return "piece-l";
}

function pieceOwnerClass(owner: Player): string {
  return owner === 1 ? "piece-p1" : "piece-p2";
}

function topPiece(row: number, col: number): Piece | null {
  return getTopPiece(board.value[row][col]);
}

function resetGame() {
  board.value = createEmptyBoard();
  reserveP1.value = createPlayerPieces(1);
  reserveP2.value = createPlayerPieces(2);
  currentPlayer.value = 1;
  winner.value = null;
  selectedSource.value = null;
  winningLine.value = null;
  draggedPieceId.value = null;
  dragOverCell.value = null;
  dragActive.value = false;
  message.value = `${player1Name.value} の手番です`;
}

/* -----------------------
   ドラッグ操作
----------------------- */
function startDragFromReserve(piece: Piece) {
  if (winner.value) return;
  if (piece.owner !== currentPlayer.value) return;

  selectedSource.value = {
    type: "reserve",
    pieceId: piece.id,
  };
  draggedPieceId.value = piece.id;
  dragActive.value = true;

  message.value = `${playerDisplayName(currentPlayer.value)}：${SIZE_LABEL[piece.size]} をドラッグ中`;
}

function startDragFromBoard(row: number, col: number) {
  if (winner.value) return;

  const piece = topPiece(row, col);
  if (!piece) return;
  if (piece.owner !== currentPlayer.value) return;

  selectedSource.value = {
    type: "board",
    row,
    col,
    pieceId: piece.id,
  };
  draggedPieceId.value = piece.id;
  dragActive.value = true;

  message.value = `${playerDisplayName(currentPlayer.value)}：${SIZE_LABEL[piece.size]} をドラッグ中`;
}

function onDragStartReserve(piece: Piece, event: DragEvent) {
  startDragFromReserve(piece);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", piece.id);
  }
}

function onDragStartBoard(row: number, col: number, event: DragEvent) {
  const piece = topPiece(row, col);
  if (!piece) return;

  startDragFromBoard(row, col);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", piece.id);
  }
}

function onDragOverCell(row: number, col: number, event: DragEvent) {
  const piece = selectedPiece.value;
  if (!piece) return;
  if (!canPlaceOnCell(piece, row, col)) return;

  event.preventDefault();
  dragOverCell.value = { row, col };

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

function onDropCell(row: number, col: number, event: DragEvent) {
  event.preventDefault();

  const piece = selectedPiece.value;
  if (!piece) {
    clearDragState();
    return;
  }

  if (!canPlaceOnCell(piece, row, col)) {
    message.value = "そのマスには置けません";
    clearDragState();
    return;
  }

  moveSelectedPieceTo(row, col);
}

function onDragEnd() {
  clearDragState();
}

function clearDragState() {
  draggedPieceId.value = null;
  dragOverCell.value = null;
  dragActive.value = false;

  if (!winner.value && !selectedSource.value) {
    message.value = `${playerDisplayName(currentPlayer.value)} の手番です`;
  }
}

function isDragOverCell(row: number, col: number): boolean {
  return dragOverCell.value?.row === row && dragOverCell.value?.col === col;
}

/* -----------------------
   画面
----------------------- */
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

    <div class="player-row">
      <div class="name-badge p1-badge">
        P1 : {{ player1Name }}
      </div>
      <div class="name-badge p2-badge">
        P2 : {{ player2Name }}
      </div>
    </div>

    <div class="turn-banner" :class="currentPlayer === 1 ? 'banner-p1' : 'banner-p2'">
      {{ message }}
    </div>

    <div class="game-layout">
      <section class="side-panel">
        <h2>{{ player2Name }}</h2>
        <div class="reserve-grid">
          <button
            v-for="piece in reserveP2"
            :key="piece.id"
            class="reserve-piece"
            :class="[
              pieceOwnerClass(piece.owner),
              pieceSizeClass(piece.size),
              { selected: currentPlayer === 2 && isSelectedReservePiece(piece.id) }
            ]"
            :disabled="currentPlayer !== 2 || winner !== null"
            @click="selectReservePiece(piece.id)"
            @dragstart="onDragStartReserve(piece, $event)"
            @dragend="onDragEnd"
            draggable="true"
            :title="reserveText(piece)"
          >
            <span class="piece-face">{{ pieceLabel(piece) }}</span>
          </button>
        </div>
      </section>

      <section class="board-shell">
        <div class="battle-board">
          <button
            v-for="(cell, index) in board.flat()"
            :key="index"
            class="cell"
            :class="{
              selected: isSelectedBoardPiece(Math.floor(index / 3), index % 3),
              playable: isPlayableCell(Math.floor(index / 3), index % 3),
              winning: isWinningCell(Math.floor(index / 3), index % 3),
              dragover: isDragOverCell(Math.floor(index / 3), index % 3),
            }"
            @click="handleCellClick(Math.floor(index / 3), index % 3)"
            @dragover="onDragOverCell(Math.floor(index / 3), index % 3, $event)"
            @drop="onDropCell(Math.floor(index / 3), index % 3, $event)"
          >
            <div class="cell-inner">
              <template v-if="topPiece(Math.floor(index / 3), index % 3)">
                <div
                  class="board-piece"
                  :class="[
                    pieceOwnerClass(topPiece(Math.floor(index / 3), index % 3)!.owner),
                    pieceSizeClass(topPiece(Math.floor(index / 3), index % 3)!.size),
                    { dragging: draggedPieceId === topPiece(Math.floor(index / 3), index % 3)!.id && dragActive }
                  ]"
                  draggable="true"
                  @dragstart="onDragStartBoard(Math.floor(index / 3), index % 3, $event)"
                  @dragend="onDragEnd"
                >
                  <span class="piece-face">
                    {{ pieceLabel(topPiece(Math.floor(index / 3), index % 3)!) }}
                  </span>
                </div>
              </template>

              <span class="stack-count" v-if="cell.length > 1">
                {{ cell.length }}
              </span>
            </div>
          </button>
        </div>
      </section>

      <section class="side-panel">
        <h2>{{ player1Name }}</h2>
        <div class="reserve-grid">
          <button
            v-for="piece in reserveP1"
            :key="piece.id"
            class="reserve-piece"
            :class="[
              pieceOwnerClass(piece.owner),
              pieceSizeClass(piece.size),
              { selected: currentPlayer === 1 && isSelectedReservePiece(piece.id) }
            ]"
            :disabled="currentPlayer !== 1 || winner !== null"
            @click="selectReservePiece(piece.id)"
            @dragstart="onDragStartReserve(piece, $event)"
            @dragend="onDragEnd"
            draggable="true"
            :title="reserveText(piece)"
          >
            <span class="piece-face">{{ pieceLabel(piece) }}</span>
          </button>
        </div>
      </section>
    </div>

    <div class="buttons">
      <button v-if="!playing" @click="startBgm">BGM再生</button>
      <button v-else @click="stopBgm">BGM停止</button>
      <button @click="resetGame">リセット</button>
      <button @click="goHome">タイトルへ戻る</button>
    </div>

    <div class="rules">
      <p>操作方法</p>
      <ul>
        <li>クリックでもドラッグでも操作できます</li>
        <li>手駒をドラッグして盤面に置けます</li>
        <li>盤面の一番上の自分の駒をドラッグして移動できます</li>
        <li>大きい駒だけ小さい駒にかぶせられます</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.battle-page {
  min-height: 100vh;
  background:
    radial-gradient(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.58)),
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
  text-shadow:
    0 0 4px #fff2b3,
    0 0 8px #13100b,
    0 0 16px #ff9f1c,
    0 0 28px #070606;
}

.player-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.name-badge {
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: bold;
  border: 1px solid rgba(255, 220, 154, 0.35);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}

.p1-badge {
  background: linear-gradient(180deg, rgba(26, 90, 40, 0.85), rgba(15, 50, 25, 0.92));
}

.p2-badge {
  background: linear-gradient(180deg, rgba(125, 30, 30, 0.85), rgba(60, 12, 12, 0.92));
}

.turn-banner {
  min-width: 260px;
  padding: 12px 18px;
  border-radius: 999px;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
  border: 1px solid rgba(255, 220, 154, 0.45);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.28),
    inset 0 0 12px rgba(255, 255, 255, 0.05);
}

.banner-p1 {
  background: linear-gradient(180deg, rgba(26, 90, 40, 0.85), rgba(15, 50, 25, 0.92));
}

.banner-p2 {
  background: linear-gradient(180deg, rgba(125, 30, 30, 0.85), rgba(60, 12, 12, 0.92));
}

.game-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.side-panel {
  width: 200px;
  min-height: 360px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 204, 112, 0.45);
  background: rgba(34, 20, 10, 0.82);
  box-shadow:
    0 10px 26px rgba(0, 0, 0, 0.35),
    0 0 18px rgba(255, 180, 80, 0.12);
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

.board-shell {
  padding: 12px;
  border-radius: 22px;
  background: rgba(18, 10, 5, 0.55);
  box-shadow:
    0 12px 28px rgba(0, 0, 0, 0.4),
    inset 0 0 18px rgba(255, 214, 130, 0.05);
}

.battle-board {
  width: 390px;
  height: 390px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 204, 112, 0.5);
  background:
    linear-gradient(180deg, rgba(90, 58, 30, 0.9), rgba(65, 38, 18, 0.95));
  box-sizing: border-box;
}

.cell {
  position: relative;
  border: 1px solid rgba(255, 219, 150, 0.18);
  border-radius: 18px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 220, 150, 0.08), rgba(0, 0, 0, 0.12)),
    rgba(75, 48, 24, 0.82);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.cell:hover {
  transform: translateY(-2px);
}

.cell.playable {
  box-shadow:
    inset 0 0 0 2px rgba(255, 221, 140, 0.28),
    0 0 14px rgba(255, 208, 110, 0.18);
}

.cell.selected {
  box-shadow:
    0 0 0 3px rgba(255, 235, 170, 0.7),
    0 0 20px rgba(255, 222, 130, 0.35);
}

.cell.dragover {
  box-shadow:
    inset 0 0 0 3px rgba(170, 235, 255, 0.9),
    0 0 22px rgba(120, 220, 255, 0.55);
}

.cell.winning {
  animation: glowWin 1s infinite alternate;
}

@keyframes glowWin {
  from {
    box-shadow:
      0 0 0 2px rgba(255, 220, 120, 0.45),
      0 0 12px rgba(255, 210, 110, 0.35);
  }
  to {
    box-shadow:
      0 0 0 3px rgba(255, 238, 176, 0.9),
      0 0 26px rgba(255, 220, 130, 0.8);
  }
}

.cell-inner {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-piece,
.reserve-piece {
  position: relative;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff7dc;
  font-weight: 900;
  text-shadow:
    0 1px 0 rgba(0, 0, 0, 0.45),
    0 0 8px rgba(0, 0, 0, 0.2);
  box-shadow:
    inset 0 10px 14px rgba(255, 255, 255, 0.18),
    inset 0 -10px 18px rgba(0, 0, 0, 0.25),
    0 6px 12px rgba(0, 0, 0, 0.35);
}

.reserve-piece {
  cursor: grab;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.board-piece {
  cursor: grab;
}

.board-piece.dragging,
.reserve-piece:active,
.board-piece:active {
  opacity: 0.55;
}

.reserve-piece:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.03);
}

.reserve-piece:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.reserve-piece.selected {
  box-shadow:
    0 0 0 4px rgba(255, 235, 170, 0.75),
    0 0 22px rgba(255, 222, 130, 0.55),
    inset 0 10px 14px rgba(255, 255, 255, 0.18),
    inset 0 -10px 18px rgba(0, 0, 0, 0.25);
}

.piece-face {
  font-size: 22px;
  line-height: 1;
}

.piece-s {
  width: 52px;
  height: 52px;
}

.piece-m {
  width: 68px;
  height: 68px;
}

.piece-l {
  width: 84px;
  height: 84px;
}

.piece-p1 {
  background:
    radial-gradient(circle at 30% 30%, rgba(164, 255, 185, 0.9), rgba(33, 122, 59, 0.95) 60%, rgba(15, 76, 33, 1));
}

.piece-p2 {
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 184, 184, 0.92), rgba(176, 45, 45, 0.95) 60%, rgba(103, 20, 20, 1));
}

.stack-count {
  position: absolute;
  right: 8px;
  bottom: 6px;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(20, 10, 5, 0.85);
  color: #ffe9b8;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 220, 150, 0.3);
}

.buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.buttons button {
  padding: 12px 20px;
  border: 1px solid rgba(255, 204, 112, 0.6);
  border-radius: 10px;
  background: rgba(40, 25, 10, 0.78);
  color: #ffdc9a;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  backdrop-filter: blur(6px);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(255, 180, 80, 0.18);
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.buttons button:hover {
  background: rgba(70, 40, 15, 0.88);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.4),
    0 0 18px rgba(255, 190, 90, 0.35);
  transform: translateY(-2px);
}

.rules {
  max-width: 720px;
  width: 100%;
  background: rgba(30, 18, 10, 0.78);
  border: 1px solid rgba(255, 204, 112, 0.4);
  border-radius: 16px;
  padding: 16px 20px;
  box-sizing: border-box;
}

.rules p {
  margin: 0 0 10px;
  font-weight: bold;
  font-size: 18px;
}

.rules ul {
  margin: 0;
  padding-left: 20px;
}

.rules li {
  margin-bottom: 6px;
}

@media (max-width: 960px) {
  .game-layout {
    flex-direction: column;
  }

  .side-panel {
    width: 100%;
    max-width: 390px;
    min-height: auto;
  }

  .battle-board {
    width: 340px;
    height: 340px;
  }

  .piece-s {
    width: 42px;
    height: 42px;
  }

  .piece-m {
    width: 56px;
    height: 56px;
  }

  .piece-l {
    width: 70px;
    height: 70px;
  }

  .piece-face {
    font-size: 18px;
  }
}
</style>