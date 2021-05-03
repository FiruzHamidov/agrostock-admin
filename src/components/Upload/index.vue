<template>
  <el-form-item label="Фото" class="avatar-uploader">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      style="cursor: pointer"
      class="avatar"
      @click="toggleShow"
    />
    <div v-else class="avatar-uploader" @click="toggleShow">
      <i class="el-icon-plus avatar-uploader-icon" />
    </div>
    <crop-upload
      :show="show"
      @input="toggleShow"
      @update-image-url="handleImageDataUrl"
      @image-loaded="handleAvatarSuccess"
    />
    <el-button v-if="upload.path || imageUrl !== ''" type="danger" @click="deleteLogo">
      Удалить лого
    </el-button>
  </el-form-item>
</template>

<script>
import CropUpload from '@/components/CropUpload'

export default {
  name: 'Upload',

  components: {
    CropUpload,
  },

  props: {
    id: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      upload: {},
      show: false,
      imageUrl: '',
    }
  },

  watch: {
    id() {
      this.init()
    },
  },

  mounted() {
    this.init()
  },

  methods: {
    async init() {
      if (!this.id) {
        this.imageUrl = ''
        this.upload = {}
        return false
      }

      this.upload = await this.$apiClient.service('uploads').get(id)
      this.imageUrl = this.upload.path
    },

    async handleAvatarSuccess(res) {
      this.imageUrl = res[0].path

      this.$emit('on-change', res[0].id)
    },

    handleImageDataUrl(url) {
      this.imageUrl = url
    },

    toggleShow() {
      this.show = !this.show
    },

    deleteLogo() {
      this.$emit('on-change', null)
    },
  },
}
</script>

<style>
.line {
  text-align: center;
}
.avatar-uploader {
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-button {
  margin-top: 15px;
}
.avatar-uploader-icon {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar-uploader-icon:hover {
  border-color: #409eff;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
