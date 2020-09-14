<template>
  <v-app>
    <!-- Окно авторизации -->
    <v-dialog
      v-model="authDialog"
      max-width="500px"
      class="z-index--big"
    >
      <v-card>
        <v-card-title class="pa-4">
          Вход
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <!-- TODO: Подставлять значение из .env -->
          <v-btn
            href="http://localhost:8000/auth/vkontakte"
            depressed
          >
            <v-icon
              small
              class="mr-2"
            >
              mdi-vk
            </v-icon>
            ВКонтакте
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-navigation-drawer
      v-model="entryDrawer"
      :bottom="$vuetify.breakpoint.smAndDown"
      app
      clipped
      right
      width="500px"
      class="pa-4 z-index--big"
    >
      <template v-if="viewMode === 1 && diveSite">
        <div class="mb-4 text-h6">
          {{ diveSite.title }}
        </div>
        <div class="mb-4">
          {{ diveSite.description }}
        </div>
        <div class="mb-4 caption">
          {{ diveSite.location.lat }},{{ diveSite.location.lng }}
        </div>
        <v-btn
          block
          depressed
          @click="editDiveSite(diveSite.id)"
        >
          Редактировать
        </v-btn>
      </template>
      <template v-if="viewMode === 2 && placemark">
        <div class="mb-4 text-h6">
          {{ placemark.title }}
        </div>
        <div class="mb-4">
          {{ placemark.description }}
        </div>
        <div class="mb-4 caption">
          {{ placemark.location.lat }},{{ placemark.location.lng }}
        </div>
        <v-btn
          block
          depressed
          @click="editPlacemark(placemark.id)"
        >
          Редактировать
        </v-btn>
      </template>
      <template v-if="viewMode === 3 && course">
        <div class="mb-4 text-h6">
          {{ course.title }}
        </div>
        <div class="mb-4">
          {{ course.description }}
        </div>
        <div class="mb-4 caption">
          {{ course.direction }} &deg;
        </div>
        <v-btn
          block
          depressed
          @click="editCourse(course.id)"
        >
          Редактировать
        </v-btn>
      </template>
    </v-navigation-drawer>
    <!-- Панель для добавления / редактирования места / метки / курса -->
    <v-navigation-drawer
      v-model="entryManagerDrawer"
      :bottom="$vuetify.breakpoint.smAndDown"
      app
      clipped
      width="500px"
      class="pa-4 z-index--big"
    >
      <!-- Добавление / редактирование места -->
      <template v-if="mode === MODE_ADD_DIVE_SITE">
        <h1 class="mb-4 text-h6">
          <template v-if="editableDiveSite.id">
            Редактирование места
          </template>
          <template v-else>
            Добавление места
          </template>
          <v-icon class="ml-2">
            mdi-map-marker-radius
          </v-icon>
        </h1>
        <v-text-field
          v-model.trim="editableDiveSite.title"
          filled
          label="Название"
        />
        <v-textarea
          v-model.trim="editableDiveSite.description"
          filled
          label="Описание"
        />
        <v-btn
          block
          depressed
          color="primary"
          class="mb-4"
          @click="storeDiveSite"
        >
          Сохранить
        </v-btn>
        <v-btn
          block
          depressed
          @click="offAddEntryMode"
        >
          Отмена
        </v-btn>
      </template>
      <!-- Добавление / редактирование метки -->
      <template v-if="mode === MODE_ADD_PLACEMARK">
        <h1 class="text-h6 text-center">
          Добавление метки
          <v-icon class="ml-2">
            mdi-map-marker-down
          </v-icon>
        </h1>
        <v-text-field
          v-model.trim="editablePlacemark.title"
          label="Название"
        />
        <v-textarea
          v-model.trim="editablePlacemark.description"
          label="Описание"
        />
        <v-btn
          block
          class="mb-4"
          @click="storePlacemark"
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
      <!-- Добавление / редактирование курса -->
      <template v-if="mode === MODE_ADD_COURSE">
        <h1 class="text-h6 text-center">
          Добавление курса
          <v-icon class="ml-2">
            mdi-map-marker-distance
          </v-icon>
        </h1>
        <v-text-field
          v-model.trim="editableCourse.title"
          label="Название"
        />
        <v-textarea
          v-model.trim="editableCourse.description"
          label="Описание"
        />
        <v-text-field
          v-model.number="editableCourse.direction"
          type="number"
          min="0"
          max="360"
          label="Курс"
        />
        <v-btn
          block
          class="mb-4"
          @click="storeCourse"
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
      clipped-right
      flat
      dark
    >
      <v-icon class="mr-2">
        mdi-diving-flippers
      </v-icon>
      <v-toolbar-title>diving-map.io</v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="$auth.loggedIn"
        small
        light
        @click="$auth.logout()"
      >
        Выход
        <v-icon
          small
          class="ml-2"
        >
          mdi-logout-variant
        </v-icon>
      </v-btn>
      <v-btn
        v-else
        small
        light
        @click="authDialog = true"
      >
        Вход
        <v-icon
          small
          class="ml-2"
        >
          mdi-login-variant
        </v-icon>
      </v-btn>
    </v-app-bar>
    <!-- Основное содержимое -->
    <v-main>
      <div class="map-wrapper fill-height">
        <!-- Карта -->
        <div
          id="map"
          class="fill-height"
        />
        <!-- Поиск местоположения пользователя -->
        <div class="map-actions map-actions--top map-actions--right pa-4 z-index--big">
          <v-btn
            small
            @click="getCurrentPosition"
          >
            <v-icon small>
              mdi-crosshairs-gps
            </v-icon>
          </v-btn>
        </div>
        <!-- Изменение масштаба карты -->
        <div class="map-actions map-actions--top pa-4 z-index--big">
          <v-btn-toggle small>
            <v-btn
              small
              @click="map.zoomIn()"
            >
              <v-icon small>
                mdi-plus
              </v-icon>
            </v-btn>
            <v-btn
              small
              @click="map.zoomOut()"
            >
              <v-icon small>
                mdi-minus
              </v-icon>
            </v-btn>
          </v-btn-toggle>
        </div>
        <!-- Добавление места / метки / курса -->
        <div
          v-if="$auth.loggedIn && mode === MODE_VIEW"
          class="map-actions map-actions--bottom pa-4 z-index--big"
        >
          <!-- Добавление места -->
          <v-btn
            small
            color="primary"
            class="mr-4"
            @click="enableAddEntryMode(MODE_ADD_DIVE_SITE)"
          >
            Добавить место
            <v-icon
              small
              class="ml-2"
            >
              mdi-map-marker-radius
            </v-icon>
          </v-btn>
          <!-- Добавление метки -->
          <v-btn
            v-if="diveSite"
            small
            class="mr-4"
            @click="enableAddEntryMode(MODE_ADD_PLACEMARK)"
          >
            Добавить метку
            <v-icon
              small
              class="ml-2"
            >
              mdi-map-marker-down
            </v-icon>
          </v-btn>
          <!-- Добавление курса -->
          <v-btn
            v-if="diveSite"
            small
            @click="enableAddEntryMode(MODE_ADD_COURSE)"
          >
            Добавить курс
            <v-icon
              small
              class="ml-2"
            >
              mdi-map-marker-distance
            </v-icon>
          </v-btn>
        </div>
      </div>
    </v-main>
    <!-- Подвал -->
    <v-footer
      app
      dark
    >
      Made with ❤️ by Roman Dynin
    </v-footer>
  </v-app>
</template>

<script>
import _ from 'lodash'

import L from 'leaflet'

import {
  MODE_VIEW,
  MODE_DRAW,
  MODE_ADD_DIVE_SITE,
  MODE_ADD_PLACEMARK,
  MODE_ADD_COURSE,
  TEMP_MARKER_STUB,
  TEMP_POLYLINE_STUB,
  DIVE_SITE_STUB,
  PLACEMARK_STUB,
  COURSE_STUB
} from '~/libs/consts'

import {
  request
} from '~/libs/jsonrpc'

/**
 * Иконка места
 */
const diveSiteMarkerIcon = L.icon({
  iconUrl: 'dive-site-marker-icon.png',
  iconSize: [36, 36]
})

/**
 * Иконка объекта
 */
const placemarkMarkerIcon = L.icon({
  iconUrl: 'placemark-marker-icon.png',
  iconSize: [36, 36]
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

      MODE_DRAW,

      MODE_ADD_DIVE_SITE,

      MODE_ADD_PLACEMARK,

      MODE_ADD_COURSE,

      /**
       * Тек. режим
       */
      mode: MODE_VIEW,

      viewMode: null,

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
       * Масштаб карты по умолчанию
       */
      mapZoom: 12,

      /**
       * Масштаб карты при показе места / объекта / курса
       */
      mapEntryZoom: 17,

      /**
       * Временные данные для работы с местом / объектом
       */
      tempMarker: _.cloneDeep(TEMP_MARKER_STUB),

      /**
       * Временные данные для работы с курсом
       */
      tempPolyline: _.cloneDeep(TEMP_POLYLINE_STUB),

      /**
       * Место
       */
      editableDiveSite: _.cloneDeep(DIVE_SITE_STUB),

      diveSite: null,

      /**
       * Объект
       */
      editablePlacemark: _.cloneDeep(PLACEMARK_STUB),

      placemark: null,

      /**
       * Курс
       */
      editableCourse: _.cloneDeep(COURSE_STUB),

      course: null,

      authDialog: false,

      backupMarker: null,

      markersMap: {}
    }
  },

  async mounted () {
    // Авторизация

    if (this.$route.query.token && !this.$auth.loggedIn) {
      const token = Buffer.from(this.$route.query.token.toString(), 'base64').toString()

      await this.$auth.setUserToken(token)

      await this.$router.replace({
        query: {
          token: undefined
        }
      })
    }

    // Карта

    this.map = L
      .map('map', {
        zoomControl: false
      })
      .setView(this.mapCenter, this.mapZoom)

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

    // Отрисовка точке

    const promises = [
      request(
        this.$axios,
        'divesite_getDiveSites'
      ),
      request(
        this.$axios,
        'placemark_getPlacemarks'
      )
    ]

    const [
      diveSitesResponse,
      placemarksResponse,
    ] = await Promise.all(promises)

    diveSitesResponse.diveSites.forEach((diveSite) => {
      this.drawDiveSite(diveSite)
    })

    placemarksResponse.placemarks.forEach((placemark) => {
      this.drawPlacemark(placemark)
    })
  },

  methods: {
    /**
     * Включение режима добавления места / метки / курса
     *
     * @param {number} mode Режим, константа MODE_*
     */
    enableAddEntryMode (mode) {
      this.mode = MODE_DRAW

      L.DomUtil.addClass(this.map._container, 'cursor--crosshair')

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

            this.map.setView(marker.getLatLng(), this.mapEntryZoom)

            this.map.off('click')

            L.DomUtil.removeClass(this.map._container, 'cursor--crosshair')

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

          if (mode === MODE_ADD_PLACEMARK) {
            icon = placemarkMarkerIcon
          }

          // Маркер

          const marker = L.marker(
            event.latlng,
            {
              icon,
              draggable: true
            }
          )

          this.tempMarker.marker = marker

          this.map.addLayer(marker)

          this.map.setView(marker.getLatLng(), this.mapEntryZoom)

          this.map.off('click')

          L.DomUtil.removeClass(this.map._container, 'cursor--crosshair')

          //

          this.mode = mode

          this.entryManagerDrawer = true
        }
      })
    },

    enableUpdateEntryMode () {

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

        this.tempPolyline = _.cloneDeep(TEMP_POLYLINE_STUB)
      } else {
        // Удаление маркера
        this.map.removeLayer(this.tempMarker.marker)

        this.tempMarker = _.cloneDeep(TEMP_MARKER_STUB)
      }

      this.mode = MODE_VIEW

      this.entryManagerDrawer = false

      if (this.backupMarker) {
        this.map.addLayer(this.backupMarker)
        this.backupMarker = null
      }
    },

    /**
     * Поиск местоположения пользователя
     */
    getCurrentPosition () {
      if (!('geolocation' in navigator)) {
        return
      }

      navigator.geolocation.getCurrentPosition((position) => {
        this.map.setView(
          [
            position.coords.latitude,
            position.coords.longitude
          ],
          this.mapZoom
        )
      })
    },

    async showDiveSite (id) {
      const { diveSite } = await request(this.$axios, 'diveSite_getDiveSiteById', { id })

      this.diveSite = diveSite

      this.entryDrawer = true

      this.viewMode = 1
    },

    /**
     * Добавление места
     */
    async storeDiveSite () {
      const { diveSite } = await request(
        this.$axios,
        this.editableDiveSite.id ? 'diveSite_updateDiveSiteById' : 'diveSite_addDiveSite',
        {
          dive_site: this.editableDiveSite,
          location: {
            lat: this.tempMarker.marker._latlng.lat,
            lng: this.tempMarker.marker._latlng.lng
          }
        }
      )

      this.diveSite = diveSite

      this.drawDiveSite(diveSite)

      this.editableDiveSite = _.cloneDeep(DIVE_SITE_STUB)

      this.backupMarker = null

      this.offAddEntryMode()
    },

    async showPlacemark (id) {
      const { placemark } = await request(this.$axios, 'placemark_getPlacemarkById', { id })

      this.placemark = placemark

      this.entryDrawer = true

      this.viewMode = 2
    },

    async storePlacemark () {
      const { placemark } = await request(
        this.$axios,
        this.editablePlacemark.id ? 'placemark_updatePlacemarkById' : 'placemark_addPlacemark',
        {
          placemark: {
            ...this.editablePlacemark,
            dive_site_id: this.editablePlacemark.dive_site_id || this.diveSite.id,
            type: 0
          },
          location: {
            lat: this.tempMarker.marker._latlng.lat,
            lng: this.tempMarker.marker._latlng.lng
          }
        }
      )

      this.placemark = placemark

      this.drawPlacemark(placemark)

      this.editablePlacemark = _.cloneDeep(PLACEMARK_STUB)

      this.offAddEntryMode()
    },

    async storeCourse () {
      const { course } = await request(
        this.$axios,
        this.editableCourse.id ? 'course_updateCourseById' : 'course_addCourse',
        {
          title: this.editableCourse.title,
          description: this.editableCourse.description,
          direction: this.editableCourse.direction,
          locations: this.tempPolyline.markers.map(marker => marker.getLatLng())
        }
      )

      this.drawCourse(course)

      this.editableCourse = _.cloneDeep(COURSE_STUB)

      this.offAddEntryMode()
    },

    editDiveSite (id) {
      const marker = this.markersMap[`divesite_${id}`]
      this.backupMarker = marker
      this.tempMarker.marker = L.marker(
        marker.getLatLng(),
        {
          draggable: true,
          icon: diveSiteMarkerIcon
        }
      )
      this.editableDiveSite = this.diveSite
      this.map.removeLayer(marker)
      this.map.addLayer(this.tempMarker.marker)
      this.mode = MODE_ADD_DIVE_SITE
      this.entryManagerDrawer = true
    },

    editPlacemark (id) {
      const marker = this.markersMap[`placemark_${id}`]
      this.backupMarker = marker
      this.tempMarker.marker = L.marker(
        marker.getLatLng(),
        {
          draggable: true,
          icon: placemarkMarkerIcon
        }
      )
      this.editablePlacemark = this.placemark
      this.map.removeLayer(marker)
      this.map.addLayer(this.tempMarker.marker)
      this.mode = MODE_ADD_PLACEMARK
      this.entryManagerDrawer = true
    },

    editCourse (id) {
      const markers = this.markersMap[`course_${id}`]
      this.backupMarkers = markers
      this.tempPolyline.markers = L.marker(
        markers[0].getLatLng(),
        {
          draggable: true,
          icon: placemarkMarkerIcon
        }
      )
      this.editableCourse = this.course
      this.map.removeLayer(markers)
      this.map.addLayer(this.tempPolyline.markers)
      this.mode = MODE_ADD_COURSE
      this.entryManagerDrawer = true
    },

    drawCourse (course) {
      course.locations.forEach((location, index) => {
        const icon = index === 0 ? courseMarkerIconA : courseMarkerIconB

        L
          .marker(
            [location.lat, location.lng],
            {
              icon
            }
          )
          .bindTooltip(course.title)
          .addTo(this.map)
      })

      const points = course.locations.map(location => [location.lat, location.lng])

      L.polyline(points).addTo(this.map)
    },

    drawDiveSite (diveSite) {
      const marker = L
        .marker(
          [diveSite.location.lat, diveSite.location.lng],
          {
            icon: diveSiteMarkerIcon
          }
        )
        .on('click', () => {
          this.showDiveSite(diveSite.id)
        })
        .bindTooltip(diveSite.title)

      this.markersMap[`divesite_${diveSite.id}`] = marker

      this.map.addLayer(marker)
    },

    drawPlacemark (placemark) {
      const marker = L
        .marker(
          [placemark.location.lat, placemark.location.lng],
          {
            icon: placemarkMarkerIcon
          }
        )
        .on('click', () => {
          this.showPlacemark(placemark.id)
        })
        .bindTooltip(placemark.title)

      this.markersMap[`placemark_${placemark.id}`] = marker

      this.map.addLayer(marker)
    }
  }
}
</script>

<style src="leaflet/dist/leaflet.css"></style>

<style>
.z-index--big
{
  z-index: 1001;
}

.cursor--crosshair
{
  cursor: crosshair !important;
}

.map-wrapper
{
  position: relative;
}

.map-actions
{
  position: absolute;
}

.map-actions--top
{
  top: 0;
}

.map-actions--right
{
  right: 0;
}

.map-actions--bottom
{
  bottom: 0;
}
</style>
