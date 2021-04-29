<template>
  <div class="editor">
      <textarea :value="input" @input="update"></textarea>
      <div v-html="compiledMarkdown"></div>
    </div>
</template>

<script>
import _ from 'lodash'
import marked from 'marked'

export default {
  name: 'Markdown',
  props: {
    input: {
      type: String,
      default: '',
    },
  },
  computed: {
    compiledMarkdown: function() {
      return marked(this.input || '', { sanitize: true })
    },
  },
  methods: {
    update: _.debounce(function(e) {
      this.$emit('on-update', e.target.value)
    }, 200),
  },
}
</script>

<style scoped>
.editor {
  margin: 0;
  height: 200px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

textarea,
.editor div {
  display: inline-block;
  width: 49%;
  height: 200px;
  overflow-y: auto;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
}

textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
}

code {
  color: #f66;
}
</style>
