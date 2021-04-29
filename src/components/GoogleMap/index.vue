<template>
  <div>
    <div>
      <label>
        <gmap-autocomplete
          class="input-gmap"
          @place_changed="setPlace"/>
        <el-button
          type="primary"
          @click.prevent="addMarker">
          Найти
        </el-button>
      </label>
    </div>
    <br>
    <gmap-map
      :center="center"
      :zoom="12"
      style="width:100%;  height: 400px;"
    >
      <gmap-marker
        :position="marker.position"
        :clickable="true"
        :draggable="true"
        @drag="updateCoordinates"
        @click="center = center.position"/>
    </gmap-map>
  </div>
</template>

<script>
export default {
  name: 'GoogleMap',

  props: {
    coordinates: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      // default to Montreal to keep it simple
      // change this to whatever makes sense
      center: this.coordinates,
      marker: {
        position: this.coordinates
      },
      currentPlace: null
    }
  },

  watch: {
    coordinates() {
      this.geolocate()
    }
  },

  mounted() {
    this.geolocate()
  },

  methods: {
    // receives a place object via the autocomplete component
    setPlace(place) {
      this.currentPlace = place
    },
    addMarker() {
      const marker = {
        lat: this.currentPlace.geometry.location.lat(),
        lng: this.currentPlace.geometry.location.lng()
      }
      this.marker.position = marker
      this.center = marker
      this.currentPlace = null

      this.$emit('coordinates_changed', marker)
    },
    updateCoordinates(location) {
      this.marker.position = {
        lat: location.latLng.lat(),
        lng: location.latLng.lng()
      }

      this.$emit('coordinates_changed', this.marker.position)
    },
    geolocate: function() {
      if (this.coordinates) {
        this.center = this.coordinates
        this.marker.position = this.coordinates
        return true
      }
      navigator.geolocation.getCurrentPosition(position => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      })
    }
  }
}
</script>

<style scoped>
.input-gmap {
  width: 400px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606226;
  height: 40px;
  line-height: 40px;
  padding: 0 15px;
}
</style>