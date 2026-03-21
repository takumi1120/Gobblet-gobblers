<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function goLocal() {
  router.push("/start");
}

function goOnline() {
  router.push("/online");
}
</script>

<template>
  <div class="mode-page">
    <div class="mode-stage">
      <button
        class="board-button board-left"
        type="button"
        @click="goLocal"
        aria-label="ローカル対戦"
      >
        <span class="board-label">
          <span class="board-title">ローカル<br>対戦</span>
          <span class="board-sub">LOCAL</span>
        </span>
      </button>

      <button
        class="board-button board-right"
        type="button"
        @click="goOnline"
        aria-label="オンライン対戦"
      >
        <span class="board-label">
          <span class="board-title">オンライン対戦</span>
          <span class="board-sub">ONLINE</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
:global(html, body, #app) {
  margin: 0;
  min-height: 100%;
}

:global(body) {
  background: #0d0805;
}

:global(#app) {
  width: 100%;
  max-width: none;
  margin: 0;
  border-inline: 0;
}

.mode-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 8px;
  background:
    radial-gradient(circle at top, rgba(87, 58, 29, 0.14), transparent 32%),
    linear-gradient(180deg, #120b07 0%, #0d0805 100%);
  overflow: hidden;
}

.mode-stage {
  position: relative;
  width: min(1520px, 100vw);
  aspect-ratio: 16 / 9;
  background: url("/backgrounds/mode-bg.jpg") center center / contain no-repeat;
}

/* 透明クリック領域 */
.board-button {
  position: absolute;
  top: 40.9%;
  width: 18.8%;
  height: 34.2%;
  border: none;
  background: transparent;
  border-radius: 18px;
  padding: 0;
  cursor: pointer;
  outline: none;
  overflow: hidden;
  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease;
}

/* 左のボード */
.board-left {
  left: 22.7%;
  margin-left: 68px;
}

/* 右のボード */
.board-right {
  left: 52.6%;
  
}

.board-button::before {
  content: "";
  position: absolute;
  inset: 4%;
  border-radius: 16px;
  background: rgba(255, 224, 170, 0.08);
  opacity: 0;
  transition: opacity 0.18s ease;
}

.board-button:hover {
  transform: translateY(-4px) scale(1.015);
  filter: brightness(1.04);
}

.board-button:hover::before {
  opacity: 1;
}

.board-button:focus-visible {
  box-shadow:
    0 0 0 4px rgba(255, 215, 130, 0.42),
    0 10px 24px rgba(0, 0, 0, 0.36);
}

/* ボード中央に文字を固定 */
.board-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 14%;
  pointer-events: none;
}

/* 左ボードの文字だけ少し右に寄せて補正 */
.board-left .board-label {
  transform: translateX(5%);
}

/* 右ボードはほぼ中央 */
.board-right .board-label {
  transform: translateX(-2%);
}

.board-title {
  display: block;
  width: 100%;
  margin: 0;
  color: #6a3b18;
  font-size: clamp(22px, 2.55vw, 44px);
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: 0.02em;
  text-shadow:
    0 1px 0 rgba(255, 244, 220, 0.6),
    0 2px 8px rgba(120, 74, 30, 0.18);
  white-space: normal;
  word-break: keep-all;
  overflow-wrap: anywhere;
}

.board-sub {
  display: block;
  width: 100%;
  margin-top: 16px;
  color: rgba(106, 59, 24, 0.82);
  font-size: clamp(11px, 0.95vw, 18px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.24em;
}

@media (max-width: 1100px) {
  .mode-page {
    padding: 0;
  }

  .mode-stage {
    width: 100vw;
  }

  .board-button {
    top: 40.8%;
    width: 19%;
    height: 34.5%;
  }

  .board-left {
    left: 22.5%;
  }

  .board-right {
    left: 52.5%;
  }

  .board-left .board-label {
    transform: translateX(2%);
  }

  .board-right .board-label {
    transform: translateX(0.5%);
  }

  .board-title {
    font-size: clamp(18px, 2.8vw, 34px);
  }

  .board-sub {
    margin-top: 10px;
    font-size: clamp(10px, 1.1vw, 14px);
  }
}

@media (max-width: 700px) {
  .board-title {
    font-size: clamp(14px, 3vw, 24px);
    line-height: 1.22;
  }

  .board-sub {
    letter-spacing: 0.16em;
    margin-top: 6px;
  }
}
</style>