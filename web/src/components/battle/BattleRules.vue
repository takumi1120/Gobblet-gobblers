<template>
  <div class="rules">
    <p>ルール</p>
    <ul>
      <li>自分の駒を選んで置く</li>
      <li>盤面の一番上に見えている自分の駒は移動できる</li>
      <li>大きい駒は小さい駒にかぶせられる</li>
      <li>見えている駒で縦・横・斜めを3つ揃えたら勝ち</li>
    </ul>
  </div>
</template>

<style scoped>
.rules {
  max-width: 720px;
  width: 100%;
  background:
    linear-gradient(180deg, rgba(36, 22, 11, 0.86), rgba(24, 14, 8, 0.82));
  border: 1px solid rgba(255, 204, 112, 0.34);
  border-radius: 18px;
  padding: 16px 20px;
  box-sizing: border-box;
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 230, 185, 0.05);
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
</style>