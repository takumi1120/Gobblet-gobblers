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

const props = defineProps<{
  size: PieceSize;
  owner: Player;
  image?: string;
  selected?: boolean;
}>();

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
</script>

<template>
  <div class="piece" :class="[wrapperClass, ownerClass, { selected }]">
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


/*各コマのサイズ*/



.owner-1.size-1  {
  top: 53%;
  width: 120px;
  height: 120px;
}

.owner-1.size-2  {
  top: 55%;
  width: 150px;
  height: 150px;
}

.owner-1.size-3  {
  top: 48%;
  width: 170px;
  height: 170px;
}

.owner-2.size-1  {
  top: 53%;
  width: 100px;
  height: 100px;
}

.owner-2.size-2 {
  top: 55%;
  width: 150px;
  height: 150px;
}

.owner-2.size-3 {
  top: 48%;
  width: 170px;
  height: 170px;
}


/* -------------------------
   P1: owner-1
   top = 上下位置
   width/height = 顔画像サイズ
------------------------- */

.owner-1.size-1 .piece-face {
  top: 56%;
  width: 20px;
  height: 20px;
}

.owner-1.size-2 .piece-face {
  top: 54%;
  width: 30px;
  height: 30px;
}

.owner-1.size-3 .piece-face {
  top: 48.5%;
  width: 36px;
  height: 36px;
}

/* -------------------------
   P2: owner-2
   top = 上下位置
   width/height = 顔画像サイズ
------------------------- */

.owner-2.size-1 .piece-face {
  top: 53%;
  width: 16px;
  height: 16px;
}

.owner-2.size-2 .piece-face {
  top: 50.5%;
  width: 27.5px;
  height: 27.5px;
}

.owner-2.size-3 .piece-face {
  top: 51%;
  width: 36px;
  height: 36px;
}

.selected {
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.9));
}

.selected .piece-base {
  transform: translateY(-2px);
}
</style>