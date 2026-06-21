<template>
  <div>
    <el-tag
      v-for="tag in tags"
      :key="tag"
      :disable-transitions="false"
      closable
      @close="handleClose(tag)">
      {{ tag }}
    </el-tag>
    <v-select
      :value="tag"
      :options="searchedTags"
      :fetch-data="fetchTags"
      :taggable="true"
      :clearable="true"
      :multiply="false"
      :infinite-loading="false"
      label="name"
      placeholder="Тег"
      @search="resetTags"
      @input="addTag" />
  </div>
</template>

<script>
export default {
  name: 'TagSelect',

  props: {
    tags: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      tag: '',
      searchedTags: [],
      tagSearch: '',
    }
  },

  methods: {
    async fetchTags() {
      const query = {
        $limit: -1,
        // name: { $ne: this.tags },
      }
      if (this.tagSearch) {
        query.$search = this.tagSearch
      }
      let response = await this.$apiClient.service('tags').find({
        query,
      })
      if (!Array.isArray(response)) {
        response = response.data
      }

      this.searchedTags = response.map(e => e.name)
    },

    resetTags(search) {
      this.tagSearch = search
      this.searchedTags = []
      this.fetchTags()
    },

    addTag(newTag) {
      console.log(newTag)
      if (!this.tags.includes(newTag)) {
        this.$emit('new-tag', newTag)
      }
      this.tag = ''
      this.tagSearch = ''
      this.searchedTags = []
    },

    handleClose(tag) {
      this.$emit('delete-tag', tag)
    },
  },
}
</script>

<style>
</style>
