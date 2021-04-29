export default {
  methods: {
    async confirmUpdate(text, onCancelText) {
      try {
        await this.$confirm(text, 'Предупреждение', {
          confirmButtonText: 'Да',
          cancelButtonText: 'Нет',
          type: 'warning'
        })
      } catch (err) {
        this.$message({
          message: onCancelText
        })
        throw new Error(err)
      }
    }
  }
}