<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../lib/api";

type ResultStats = {
  id: number;
  name: string;
  win_count: number;
  lose_count: number;
};

const stats = ref<ResultStats[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function fetchStats() {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get("/results/stats");
    stats.value = res.data.items ?? [];
  } catch (e: any) {
    error.value =
      e?.response?.data?.message ??
      e?.message ??
      "戦績取得に失敗しました";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchStats();
});
</script>
<template>
  <div>
    <h1>戦績一覧</h1>

    <p v-if="loading">読み込み中...</p>
    <p v-if="error">{{ error }}</p>

    <table v-if="!loading && !error" border="1">
      <thead>
        <tr>
          <th>名前</th>
          <th>勝利数</th>
          <th>敗北数</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in stats" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.win_count }}</td>
          <td>{{ item.lose_count }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>