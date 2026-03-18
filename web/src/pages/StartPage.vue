<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { api } from "../lib/api";

const router = useRouter();

async function go(route: string) {
  router.push(route);
}

type User = {
  id: number;
  name: string;
};

const items = ref<User[]>([]);
const selectedP1 = ref<number | "">("");
const selectedP2 = ref<number | "">("");
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(() => {
  fetchUsers();
});

async function fetchUsers() {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get("/users");
    items.value = res.data.items ?? [];
  } catch (e: any) {
    error.value =
      e?.response?.data?.error?.message ??
      e?.response?.data?.message ??
      e?.message ??
      "ユーザー取得に失敗しました";
  } finally {
    loading.value = false;
  }
}

const p1Options = computed(() => {
  return items.value.filter((u) => u.id !== selectedP2.value);
});

const p2Options = computed(() => {
  return items.value.filter((u) => u.id !== selectedP1.value);
});

const player1 = computed(() => {
  return items.value.find((u) => u.id === selectedP1.value) ?? null;
});

const player2 = computed(() => {
  return items.value.find((u) => u.id === selectedP2.value) ?? null;
});

function startBattle() {
  if (!player1.value || !player2.value) {
    error.value = "P1とP2の両方を選択してください";
    return;
  }

  if (player1.value.id === player2.value.id) {
    error.value = "同じユーザーは選べません";
    return;
  }

  error.value = null;

  router.push({
    path: "/battle",
    query: {
      p1Id: String(player1.value.id),
      p1Name: player1.value.name,
      p2Id: String(player2.value.id),
      p2Name: player2.value.name,
    },
  });
}
</script>

<template>
  <div class="app">
    <h1>Gobolin Gobblers</h1>

    <div class="player-box p1-box">
      <label class="select-label" for="P1">P1ユーザー選択</label>
      <select id="P1" v-model="selectedP1" class="player-select">
        <option value="">選択してください</option>
        <option v-for="u in p1Options" :key="u.id" :value="u.id">
          {{ u.name }}
        </option>
      </select>

      <button class="Cselect">キャラクター選択</button>
    </div>

    <div class="player-box p2-box">
      <label class="select-label" for="P2">P2ユーザー選択</label>
      <select id="P2" v-model="selectedP2" class="player-select">
        <option value="">選択してください</option>
        <option v-for="u in p2Options" :key="u.id" :value="u.id">
          {{ u.name }}
        </option>
      </select>

      <button class="Cselect">キャラクター選択</button>
    </div>

    <div class="bottom-buttons">
      <button @click="go('/result')">戦績表示</button>
      <button @click="startBattle">対戦開始</button>
      <button @click="go('/user')">ユーザー登録</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background:
    url("../assets/startpage.png") center center / 40% no-repeat,
    url("../assets/tavern-bg.png") center center / cover no-repeat;
  position: relative;
  font-family: system-ui;
}

.app::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

h1 {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  margin: 0;
  color: #ffd27a;
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  text-shadow:
    0 0 4px #fff2b3,
    0 0 8px #13100b,
    0 0 16px #ff9f1c,
    0 0 28px #070606;
}

.player-box {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 240px;
}

.p1-box {
  top: 15%;
  left: 5%;
}

.p2-box {
  top: 15%;
  right: 5%;
}

.select-label {
  color: #ffdc9a;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}

.player-select {
  padding: 12px 14px;
  border: 1px solid rgba(255, 204, 112, 0.6);
  border-radius: 10px;
  background: rgba(40, 25, 10, 0.8);
  color: #ffdc9a;
  font-size: 16px;
  outline: none;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.35),
    0 0 12px rgba(255, 180, 80, 0.18);
}

button {
  position: relative;
  z-index: 1;
  padding: 12px 20px;
  margin: 8px;
  border: 1px solid rgba(255, 204, 112, 0.6);
  border-radius: 10px;
  background: rgba(40, 25, 10, 0.75);
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
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

button:hover {
  background: rgba(70, 40, 15, 0.88);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.4),
    0 0 18px rgba(255, 190, 90, 0.35);
  transform: translateY(-2px);
}

button:active {
  transform: translateY(0);
  opacity: 0.92;
}

button:focus,
.player-select:focus {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(255, 204, 112, 0.28),
    0 6px 16px rgba(0, 0, 0, 0.4);
}

.bottom-buttons {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  gap: 12px;
}

.error {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  color: #ff8a8a;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 10px;
  border-radius: 8px;
}
</style>