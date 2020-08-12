<template>
  <v-app>
    <!-- Панель для работы с записью -->
    <v-navigation-drawer
      v-model="entryManagerDrawer"
      :bottom="$vuetify.breakpoint.smAndDown"
      app
      clipped
      width="500"
      class="pa-4 fix-z-index"
    >
      <!-- Режим добавления места -->
      <template v-if="mode === MODE_ADD_DIVE_SITE">
        <h1 class="text-h6 text-center">
          Новое место
        </h1>
        <v-text-field
          v-model.trim="tempMarker.title"
          label="Название"
        />
        <v-btn
          block
          class="mb-4"
        >
          Сохранить
        </v-btn>
        <v-btn
          block
          @click="offAddEntryMode"
        >
          Отмена
        </v-btn>
      </template>
      <!-- Режим добавления объекта -->
      <template v-if="mode === MODE_ADD_OBJECT">
        <h1 class="text-h6 text-center">
          Новый объект
        </h1>
        <v-text-field
          v-model.trim="tempMarker.title"
          label="Название"
        />
        <v-btn
          block
          class="mb-4"
        >
          Сохранить
        </v-btn>
        <v-btn
          block
          @click="offAddEntryMode"
        >
          Отмена
        </v-btn>
      </template>
      <!-- Режим добавления курса -->
      <template v-if="mode === MODE_ADD_COURSE">
        <h1 class="text-h6 text-center">
          Новый курс
        </h1>
        <v-text-field
          v-model="tempPolyline.direction"
          type="number"
          min="0"
          max="360"
          label="Курс"
        />
        <v-btn
          block
          class="mb-4"
        >
          Сохранить
        </v-btn>
        <v-btn
          block
          @click="offAddEntryMode"
        >
          Отмена
        </v-btn>
      </template>
    </v-navigation-drawer>
    <!-- Шапка -->
    <v-app-bar
      app
      clipped-left
    >
      <v-app-bar-nav-icon />
      <v-toolbar-title>diving-map.ru</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <div
        id="map"
        class="fill-height"
      />
    </v-main>
    <!-- Подвал -->
    <v-footer
      app
      padless
    >
      <v-card
        flat
        tile
        width="100%"
      >
        <v-card-text v-if="mode === MODE_VIEW">
          <v-btn
            class="mr-4"
            @click="onAddEntryMode(MODE_ADD_DIVE_SITE)"
          >
            Добавить место
          </v-btn>
          <v-btn
            class="mr-4"
            @click="onAddEntryMode(MODE_ADD_OBJECT)"
          >
            Добавить объект
          </v-btn>
          <v-btn
            class="mr-4"
            @click="onAddEntryMode(MODE_ADD_COURSE)"
          >
            Добавить курс
          </v-btn>
        </v-card-text>
        <v-divider />
        <v-card-text>
          {{ new Date().getFullYear() }}
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
import L from 'leaflet'

import {
  MODE_VIEW,
  MODE_DRAW,
  MODE_ADD_DIVE_SITE,
  MODE_ADD_OBJECT,
  MODE_ADD_COURSE
} from '~/libs/consts'

/**
 * Иконка места
 */
const diveSiteMarkerIcon = L.icon({
  iconUrl: 'dive-site-marker-icon.png',
  iconSize: [24, 24]
})

/**
 * Иконка объекта
 */
const objectMarkerIcon = L.icon({
  iconUrl: 'object-marker-icon.png',
  iconSize: [24, 24]
})

/**
 * Иконка курса (точка A)
 */
const courseMarkerIconA = L.icon({
  iconUrl: 'course-marker-icon-a.png',
  iconSize: [24, 24]
})

/**
 * Иконка курса (точка B)
 */
const courseMarkerIconB = L.icon({
  iconUrl: 'course-marker-icon-b.png',
  iconSize: [24, 24]
})

export default {
  data () {
    return {
      MODE_VIEW,

      MODE_ADD_DIVE_SITE,

      MODE_ADD_OBJECT,

      MODE_ADD_COURSE,

      /**
       * Тек. режим
       */
      mode: MODE_VIEW,

      /**
       * Панель для работы с записью
       */
      entryManagerDrawer: false,

      /**
       * Панель для отображения записи
       */
      entryDrawer: false,

      /**
       * Карта
       */
      map: null,

      /**
       * Координаты центра карты по умолчанию
       */
      mapCenter: [
        53.4367995,
        34.2885255
      ],

      /**
       * Временные данные для работы с местом / объектом
       */
      tempMarker: this.getDefaultTempMarker(),

      /**
       * Временные данные для работы с курсом
       */
      tempPolyline: this.getDefaultTempPolyline()
    }
  },

  mounted () {
    // Карта

    this.map = L
      .map('map')
      .setView(this.mapCenter, 17)

    // Слой Google Maps

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
  },

  methods: {
    /**
     * Активация режима добавления места / объекта / курса
     *
     * @param {number} mode Режим, константа MODE_*
     */
    onAddEntryMode (mode) {
      this.mode = MODE_DRAW

      this.map.on('click', (event) => {
        // Режим добавления курса

        if (mode === MODE_ADD_COURSE) {
          // Иконка маркера

          const icon = this.tempPolyline.markers.length ? courseMarkerIconB : courseMarkerIconA

          // Маркер

          const marker = L
            .marker(
              event.latlng,
              {
                icon,
                draggable: true
              }
            )
            .on('move', () => {
              // Перерисовка линии при перемещении маркера

              const points = this.tempPolyline.markers.map(marker => marker.getLatLng())

              this.tempPolyline.polyline.setLatLngs(points)
            })

          this.tempPolyline.markers.push(marker)

          this.map.addLayer(marker)

          // Маркер точки B?

          if (this.tempPolyline.markers.length === 2) {
            const points = this.tempPolyline.markers.map(marker => marker.getLatLng())

            this.tempPolyline.polyline = new L.Polyline(points)

            this.map.addLayer(this.tempPolyline.polyline)

            this.map.off('click')

            //

            this.mode = mode

            this.entryManagerDrawer = true
          }
        } else {
          // Иконка маркера

          let icon

          if (mode === MODE_ADD_DIVE_SITE) {
            icon = diveSiteMarkerIcon
          }

          if (mode === MODE_ADD_OBJECT) {
            icon = objectMarkerIcon
          }

          // Маркер

          this.tempMarker.marker = L.marker(event.latlng, {
            icon,
            draggable: true
          })

          this.map.addLayer(this.tempMarker.marker)

          this.map.off('click')

          //

          this.mode = mode

          this.entryManagerDrawer = true
        }
      })
    },

    /**
     * Деактивация режима добавления места / объекта / курса
     */
    offAddEntryMode () {
      // Режим добавления курса

      if (this.mode === MODE_ADD_COURSE) {
        // Удаление маркеров и линии

        this.tempPolyline.markers.forEach(marker => this.map.removeLayer(marker))

        this.map.removeLayer(this.tempPolyline.polyline)

        this.tempPolyline = this.getDefaultTempPolyline()
      } else {
        // Удаление маркера
        this.map.removeLayer(this.tempMarker.marker)

        this.tempMarker = this.getDefaultTempMarker()
      }

      this.mode = MODE_VIEW

      this.entryManagerDrawer = false
    },

    /**
     * Получение временные данных для работы с местом / объектом по умолчанию
     */
    getDefaultTempMarker: () => ({
      /**
       * Марке
       */
      marker: null,

      title: null
    }),

    /**
     * Получение временных данных для работы с курсом по умолчанию
     */
    getDefaultTempPolyline: () => ({
      /**
       * Маркеры (точка A и B)
       */
      markers: [],

      /**
       * Линия
       */
      polyline: null,

      /**
       * Направление (число от 0 до 360)
       */
      direction: 0
    })
  }
}
</script>

<style src="leaflet/dist/leaflet.css"></style>

<style>
.fix-z-index
{
  z-index: 1001;
}
</style>
