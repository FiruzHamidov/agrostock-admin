<template>
<div>
  <el-tag
    :key="tag"
    v-for="tag in tags"
    closable
    :disable-transitions="false"
    @close="handleClose(tag)">
    {{tag}}
  </el-tag>
  <v-select
    :value="tag"
    label="name"
    :options="searchedTags"
    :fetchData="fetchTags"
    :taggable="true"
    :clearable="true"
    :multiply="false"
    :infinite-loading="false"
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
      if (Array.isArray(response)) {
        response = response
      } else {
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
