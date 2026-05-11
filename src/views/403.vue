<template>
  <div class="errPage-container">
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo text-ginormous">403</h1>
        <h2>Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этой страницы.</p>
        <el-button type="primary" @click="$router.push('/')">На главную</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Page403',
}
</script>

<style scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;
}

.text-jumbo {
  font-size: 60px;
  font-weight: 700;
  color: #484848;
}
</style>
