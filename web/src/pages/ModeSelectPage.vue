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
    <div class="mode-title">
      <div class="mode-title-main">Gobblet Gobblers</div>
      <div class="mode-title-sub">モードを選択してください</div>
    </div>

    <div class="mode-stage">
      <button
        class="board-button board-left"
        type="button"
        @click="goLocal"
        aria-label="ローカル対戦"
      >
        <span class="board-label">
          <span class="board-title">ローカル<br />対戦</span>
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
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 12px;
  background:
    radial-gradient(circle at top, rgba(87, 58, 29, 0.14), transparent 32%),
    linear-gradient(180deg, #120b07 0%, #0d0805 100%);
  overflow: hidden;
}

.mode-title {
  position: absolute;
  top: 18%;
  left: 50%;
  transform: translateX(-50%);
  width: min(92vw, 900px);
  text-align: center;
  z-index: 5;
  pointer-events: none;
}

.mode-title-main {
  color: #f8dfb0;
  font-size: clamp(34px, 4vw, 64px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.06em;
  text-shadow:
    0 2px 0 rgba(70, 35, 10, 0.85),
    0 6px 18px rgba(0, 0, 0, 0.45),
    0 0 24px rgba(255, 196, 96, 0.18);
  white-space: nowrap;
}

.mode-title-sub {
  margin-top: 10px;
  color: rgba(255, 232, 185, 0.92);
  font-size: clamp(14px, 1.2vw, 22px);
  font-weight: 700;
  letter-spacing: 0.16em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.mode-stage {
  position: relative;
  width: min(1520px, 100vw);
  aspect-ratio: 16 / 9;
  background: url("/backgrounds/mode-bg.jpg") center center / contain no-repeat;
}

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
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    box-shadow 0.18s ease;
}

.board-left {
  left: 22.7%;
  margin-left: 68px;
}

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

.board-button:hover::before,
.board-button:active::before {
  opacity: 1;
}

.board-button:focus-visible {
  box-shadow:
    0 0 0 4px rgba(255, 215, 130, 0.42),
    0 10px 24px rgba(0, 0, 0, 0.36);
}

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

.board-left .board-label {
  transform: translateX(5%);
}

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
    margin-left: 48px;
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

@media (max-width: 820px) {
  .mode-page {
    grid-template-rows: auto 1fr;
    align-items: stretch;
    padding: 0;
  }

  .mode-title {
    top: max(20px, env(safe-area-inset-top));
    width: min(94vw, 540px);
  }

  .mode-title-main {
    font-size: clamp(28px, 8.5vw, 48px);
    white-space: normal;
  }

  .mode-title-sub {
    margin-top: 8px;
    font-size: clamp(12px, 3.5vw, 16px);
    letter-spacing: 0.1em;
  }

  .mode-stage {
    width: max(100vw, calc((100svh - 148px) * 16 / 9));
    height: calc(100svh - 120px);
    aspect-ratio: auto;
    background-size: cover;
    background-position: center center;
  }

  .board-button {
    top: 45.2%;
    width: 27%;
    height: 27.5%;
    border-radius: 20px;
  }

  .board-left {
    left: 20.6%;
    margin-left: 0;
  }

  .board-right {
    left: 52.4%;
  }

  .board-label {
    padding: 0 12%;
  }

  .board-left .board-label,
  .board-right .board-label {
    transform: none;
  }

  .board-title {
    font-size: clamp(18px, 4.6vw, 30px);
    line-height: 1.2;
  }

  .board-sub {
    margin-top: 8px;
    font-size: clamp(10px, 2.5vw, 13px);
    letter-spacing: 0.12em;
  }
}

@media (max-width: 520px) {
  .mode-title {
    top: max(16px, env(safe-area-inset-top));
  }

  .mode-stage {
    width: max(112vw, calc((100svh - 132px) * 16 / 9));
    height: calc(100svh - 104px);
  }

  .board-button {
    top: 48.8%;
    width: 30.5%;
    height: 24.8%;
  }

  .board-left {
    left: 17.2%;
    margin-left: 20px;
  }

  .board-right {
    left: 52.2%;
    margin-right: 15px;
  }

  .board-title {
    font-size: clamp(16px, 4.8vw, 24px);
  }

  .board-sub {
    margin-top: 6px;
    font-size: 10px;
    letter-spacing: 0.08em;
  }
}
</style>
