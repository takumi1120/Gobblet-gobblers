<script setup lang="ts">
import { computed } from "vue";

import pieceSmall from "../../assets/pieces/pieces-S.png";
import pieceMedium from "../../assets/pieces/pieces-M.png";
import pieceLarge from "../../assets/pieces/pieces-L.png";

type PieceSize = 1 | 2 | 3;

const props = defineProps<{
  size: PieceSize;
  image?: string;
  selected?: boolean;
}>();

const baseImage = computed(() => {
  if (props.size === 1) return pieceSmall;
  if (props.size === 2) return pieceMedium;
  return pieceLarge;
});

const wrapperClass = computed(() => {
  return `size-${props.size}`;
});
</script>

<template>
  <div class="piece" :class="[wrapperClass, { selected: selected }]">
    <img class="piece-base" :src="baseImage" alt="piece" />
    <div class="piece-face" v-if="image">
      <img :src="image" alt="character" />
    </div>
  </div>
</template>

<style scoped>
.piece {
  position: relative;
  display: inline-block;
  user-select: none;
}

.piece-base {
  display: block;
  width: 100%;
  height: auto;
  pointer-events: none;
}

.piece-face {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
}

.piece-face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.size-1 {
  width: 56px;
}
.size-1 .piece-face {
  width: 22px;
  height: 22px;
  top: 49%;
}

.size-2 {
  width: 72px;
}
.size-2 .piece-face {
  width: 28px;
  height: 28px;
  top: 49%;
}

.size-3 {
  width: 92px;
}
.size-3 .piece-face {
  width: 36px;
  height: 36px;
  top: 49%;
}

.selected {
  filter: drop-shadow(0 0 10px rgba(255, 220, 80, 0.95));
  transform: translateY(-2px);
}
</style>