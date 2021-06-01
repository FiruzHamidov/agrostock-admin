<template>
  <el-dialog :visible.sync="show" title="Документы">
    <template v-if="documents">
      <div v-for="document in documents" :key="document.id + Math.random()" class="document">
        <template v-if="document.mimetype.includes('image')">
          <p>{{ document.originalname }}</p>
          <el-image :src="document.path" style="width: 200px; height: 200px; object-fit: contain;">
          </el-image>
        </template>
        <template v-else>
          <a :href="document.path" target="_blank" rel="noopener noreferrer">{{
            document.originalname
          }}</a>
        </template>
      </div>
    </template>
    <p v-else>Документов нет</p>
  </el-dialog>
</template>

<script>
export default {
  name: 'DocumentView',
  props: {
    documents: {
      type: Array,
      default: () => [],
    },
    showDocuments: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show: this.showDocuments,
    }
  },
}
</script>

<style>
.document {
  height: 100%;
}
</style>
