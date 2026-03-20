<script setup lang="ts">
import { computed } from "vue";
import type { Player } from "../../types/battle.types";

import blueSmall from "../../assets/pieces/pieces-S.png";
import blueMedium from "../../assets/pieces/pieces-M.png";
import blueLarge from "../../assets/pieces/pieces-L.png";

import redSmall from "../../assets/pieces/pieces-S1.png";
import redMedium from "../../assets/pieces/pieces-M1.png";
import redLarge from "../../assets/pieces/pieces-L1.png";

type PieceSize = 1 | 2 | 3;
type PiecePlacement = "board" | "reserve";

const props = withDefaults(
  defineProps<{
    size: PieceSize;
    owner: Player;
    image?: string;
    selected?: boolean;
    placement?: PiecePlacement;
  }>(),
  {
    placement: "board",
  }
);

const baseImage = computed(() => {
  if (props.owner === 1) {
    if (props.size === 1) return blueSmall;
    if (props.size === 2) return blueMedium;
    return blueLarge;
  }

  if (props.size === 1) return redSmall;
  if (props.size === 2) return redMedium;
  return redLarge;
});

const wrapperClass = computed(() => `size-${props.size}`);
const ownerClass = computed(() => `owner-${props.owner}`);
const placementClass = computed(() => `placement-${props.placement}`);
</script>

<template>
  <div class="piece" :class="[wrapperClass, ownerClass, placementClass, { selected }]">
    <img class="piece-base" :src="baseImage" alt="piece" />

    <div v-if="image" class="piece-face">
      <img :src="image" alt="character" />
    </div>
  </div>
</template>

<style scoped>
.piece {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.piece-base {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  transition: transform 0.15s ease;
}

.piece-face {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.piece-face img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 駒本体の基準サイズ */
.size-1 {
  width: 56px;
  height: 56px;
}

.size-2 {
  width: 76px;
  height: 76px;
}

.size-3 {
  width: 96px;
  height: 96px;
}

/* =========================
   盤面用
   ========================= */

/* P1 */
.placement-board.owner-1.size-1 .piece-face {
  top: 56%;
  width: 14px;
  height: 14px;
}

.placement-board.owner-1.size-2 .piece-face {
  top: 54%;
  width: 20px;
  height: 20px;
}

.placement-board.owner-1.size-3 .piece-face {
  top: 48.5%;
  width: 25px;
  height: 25px;
}

/* P2 */
.placement-board.owner-2.size-1 .piece-face {
  top: 53%;
  width: 12px;
  height: 12px;
}

.placement-board.owner-2.size-2 .piece-face {
  top: 50.5%;
  width: 18px;
  height: 18px;
}

.placement-board.owner-2.size-3 .piece-face {
  top: 51%;
  width: 25px;
  height: 25px;
}

/* =========================
   持ち駒用
   ここだけ別で調整
   ========================= */

/* P1 */
.placement-reserve.owner-1.size-1 .piece-face {
  top: 58%;
  width: 13px;
  height: 13px;
}

.placement-reserve.owner-1.size-2 .piece-face {
  top: 56%;
  width: 18px;
  height: 18px;
}

.placement-reserve.owner-1.size-3 .piece-face {
  top: 50%;
  width: 22px;
  height: 22px;
}

/* P2 */
.placement-reserve.owner-2.size-1 .piece-face {
  top: 55%;
  width: 11px;
  height: 11px;
}

.placement-reserve.owner-2.size-2 .piece-face {
  top: 52%;
  width: 17px;
  height: 17px;
}

.placement-reserve.owner-2.size-3 .piece-face {
  top: 52%;
  width: 22px;
  height: 22px;
}

.selected {
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.9));
}

.selected .piece-base {
  transform: translateY(-2px);
}
</style>