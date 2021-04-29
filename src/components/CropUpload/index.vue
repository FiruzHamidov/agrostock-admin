<template>
  <crop-upload
    v-model="componentShow"
    :width="800"
    :height="600"
    :url="fileUrl"
    :headers="headerInfo"
    lang-type="ru"
    field="file"
    img-format="png"
    @crop-success="handleImageDataUrl"
    @crop-upload-success="handleAvatarSuccess"
  />
</template>

<script>
import { mapGetters } from 'vuex'
import cropUpload from 'vue-image-crop-upload'

export default {
  name: 'CropUpload',

  components: {
    cropUpload,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      fileUrl: `${process.env.FILE_URL}/uploads/`,
      componentShow: false,
    }
  },

  computed: {
    ...mapGetters({
      token: 'user/token',
    }),
    headerInfo() {
      return {
        Authorization: `Bearer ${this.token}`,
      }
    },
  },

  watch: {
    show() {
      this.componentShow = this.show
    },
  },

  methods: {
    handleImageDataUrl(url) {
      this.$emit('update-image-url', url)
    },

    handleAvatarSuccess(response) {
      this.$emit('image-loaded', response)
    },
  },
}
</script>
