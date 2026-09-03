<template>
  <div class="login-page">
    <div class="login-card">
      <h1>管理员登录</h1>
      <p class="tip">阶段 3 实现：账号密码登录 + JWT 鉴权 + 重定向回源页面</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
}

.login-card {
  width: 360px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 32px;
  text-align: center;
}

h1 {
  font-size: 20px;
  font-weight: 700;
}

.tip {
  margin-top: 10px;
  font-size: 13px;
  color: var(--ink-2);
}
</style>
