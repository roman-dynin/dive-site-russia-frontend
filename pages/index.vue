<template>
  <v-app>
    <div
      id="map"
      class="map"
    />
    <v-btn @click.prevent="setMode(1)">
      Добавить место
    </v-btn>
  </v-app>
</template>

<script>
import L from 'leaflet'

export default {
  data: () => ({
    map: null,

    center: [
      53.4367995,
      34.2885255
    ],

    mode: 0
  }),

  mounted () {
    this.map = L
      .map('map')
      .setView(this.center, 17)

    L
      .tileLayer(
        'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        {
          subdomains: [
            'mt0',
            'mt1',
            'mt2',
            'mt3'
          ]
        }
      )
      .addTo(this.map)

    this.map.on('click', (event) => {
      if (this.mode !== 1) {
        return
      }

      L
        .marker(
          event.latlng,
          {
            title: 'Новое место',
            opacity: 0.8
          }
        )
        .addTo(this.map)
    })
  },

  methods: {
    setMode (mode) {
      this.mode = mode
    }
  }
}
</script>

<style src="leaflet/dist/leaflet.css"></style>

<style>
.map {
  width: 100%;
  height: 100%;
}
</style>
