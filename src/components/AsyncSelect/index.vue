<template>
  <v-select
    :value="address"
    v-bind="bind"
    :label="label"
    :reduce="reduce"
    :options="addresses"
    :fetch-data="fetchAddresses"
    :taggable="taggable"
    :clearable="clearable"
    :infinite-loading="false"
    :placeholder="placeholder"
    @search="resetAddresses"
    @input="addressChanged"
  />
</template>

<script>
export default {
  name: 'AddressSelect',

  props: {
    service: {
      type: String,
      required: true,
    },
    taggable: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    value: {
      type: [Array, Number, Object, String],
      default: () => [],
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    bind: {
      type: Object,
      default: () => ({}),
    },
    reduce: {
      type: Function,
      default: val => val.id,
    },
    additionalQuery: {
      type: Object,
      default: () => ({}),
    },
    queryLimit: {
      type: Number,
      default: -1,
    },
    remoteSearch: {
      type: Boolean,
      default: true,
    },
    searchParam: {
      type: String,
      default: 'search',
    },
  },

  data() {
    return {
      address: {},
      addresses: [],
      addressSearch: '',
    }
  },

  watch: {
    value: {
      handler(val) {
        this.address = val
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    async fetchAddresses() {
      const query = {
        $limit: this.queryLimit,
        ...this.additionalQuery,
      }
      if (this.addressSearch && this.remoteSearch && this.searchParam) {
        query[this.searchParam] = this.addressSearch
      }
      const response = await this.$apiClient.service(this.service).find({
        query,
      })
      if (Array.isArray(response)) {
        this.addresses = response
      } else {
        this.addresses = response.data
      }
    },

    resetAddresses(search) {
      this.addressSearch = search
      this.addresses = []
      this.fetchAddresses()
    },

    addressChanged(address) {
      this.address = address
      this.$emit('value-changed', this.address)
    },
  },
}
</script>

<style>
.vs--searchable .vs__dropdown-toggle {
  height: 40px;
}
</style>
