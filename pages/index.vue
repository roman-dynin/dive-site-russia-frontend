<template>
  <v-app>
    <v-dialog
      v-model="authDialog"
      max-width="500px"
      class="z-index--big"
    >
      <v-card>
        <v-card-title
          class="pa-4"
        >
          Вход
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
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
          <v-btn
            href="http://localhost:8000/auth/telegram"
            depressed
          >
            <v-icon
              small
              class="mr-2"
            >
              mdi-telegram
            </v-icon>
            Telegram
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- Панель для работы с записью -->
    <v-navigation-drawer
      v-model="entryManagerDrawer"
      :bottom="$vuetify.breakpoint.smAndDown"
      app
      clipped
      width="500"
      class="pa-4 z-index--big"
    >
      <!-- Режим добавления места -->
      <template v-if="mode === MODE_ADD_DIVE_SITE">
        <h1 class="text-h6 text-center">
          Добавление места
          <v-icon class="ml-2">
            mdi-map-marker-radius
          </v-icon>
        </h1>
        <v-text-field
          v-model.trim="editableDiveSite.title"
          label="Название"
        />
        <v-textarea
          v-model.trim="editableDiveSite.description"
          label="Описание"
        />
        <v-btn
          block
          class="mb-4"
          @click="addDiveSite"
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
      <template v-if="mode === MODE_ADD_SUBMERGED_OBJECT">
        <h1 class="text-h6 text-center">
          Добавление объекта
          <v-icon class="ml-2">
            mdi-map-marker-down
          </v-icon>
        </h1>
        <v-text-field
          v-model.trim="editableSubmergedObject.title"
          label="Название"
        />
        <v-textarea
          v-model.trim="editableSubmergedObject.description"
          label="Описание"
        />
        <v-btn
          block
          class="mb-4"
          @click="addSubmergedObject"
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
          @click="addCourse"
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
        @click="authDialog = !authDialog"
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
    <v-main>
      <div class="map-wrapper fill-height">
        <!-- Карта -->
        <div
          id="map"
          class="fill-height"
        />
        <!-- Кнопки управления -->
        <div class="pa-4 map-actions map-actions--top map-actions--right z-index--big">
          <v-btn
            small
            @click="getCurrentPosition"
          >
            <v-icon small>
              mdi-crosshairs-gps
            </v-icon>
          </v-btn>
        </div>
        <div class="pa-4 map-actions map-actions--top z-index--big">
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
        <div class="pa-4 map-actions map-actions map-actions--bottom z-index--big">
          <template v-if="mode === MODE_VIEW">
            <v-btn
              small
              color="primary"
              class="mr-4"
              @click="onAddEntryMode(MODE_ADD_DIVE_SITE)"
            >
              Добавить место
              <v-icon
                small
                class="ml-2"
              >
                mdi-map-marker-radius
              </v-icon>
            </v-btn>
            <v-btn
              small
              class="mr-4"
              @click="onAddEntryMode(MODE_ADD_SUBMERGED_OBJECT)"
            >
              Добавить объект
              <v-icon
                small
                class="ml-2"
              >
                mdi-map-marker-down
              </v-icon>
            </v-btn>
            <v-btn
              small
              @click="onAddEntryMode(MODE_ADD_COURSE)"
            >
              Добавить курс
              <v-icon
                small
                class="ml-2"
              >
                mdi-map-marker-distance
              </v-icon>
            </v-btn>
          </template>
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
  MODE_ADD_SUBMERGED_OBJECT,
  MODE_ADD_COURSE,
  TEMP_MARKER_STUB,
  TEMP_POLYLINE_STUB,
  DIVE_SITE_STUB,
  SUBMERGED_OBJECT_STUB,
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
const submergedObjectMarkerIcon = L.icon({
  iconUrl: 'submerged-object-marker-icon.png',
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

      MODE_ADD_SUBMERGED_OBJECT,

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

      /**
       * Объект
       */
      editableSubmergedObject: _.cloneDeep(SUBMERGED_OBJECT_STUB),

      /**
       * Курс
       */
      editableCourse: _.cloneDeep(COURSE_STUB),

      authDialog: false
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

    // Отрисовка точек
    /*

    const { diveSites } = await request(
      this.$axios,
      'divesite_getDiveSites',
      {}
    )

    const { submergedObjects } = await request(
      this.$axios,
      'submergedObject_getSubmergedObjects',
      {}
    )

    const { courses } = await request(
      this.$axios,
      'course_getCourses',
      {}
    )

    diveSites.forEach((diveSite) => {
      L
        .marker(
          diveSite.point.location,
          {
            icon: diveSiteMarkerIcon
          }
        )
        .bindTooltip(diveSite.title)
        .addTo(this.map)
    })

    submergedObjects.forEach((submergedObject) => {
      L
        .marker(
          submergedObject.point.location,
          {
            icon: submergedObjectMarkerIcon
          }
        )
        .bindTooltip(submergedObject.title)
        .addTo(this.map)
    })

    courses.forEach((course) => {
      course.points.forEach((point, index) => {
        const icon = index === 0 ? courseMarkerIconA : courseMarkerIconB

        L
          .marker(
            point.location,
            {
              icon
            }
          )
          .bindTooltip(course.title)
          .addTo(this.map)
      })

      const points = course.points.map(point => point.location)

      L.polyline(points).addTo(this.map)
    })
    */
  },

  methods: {
    /**
     * Активация режима добавления места / объекта / курса
     *
     * @param {number} mode Режим, константа MODE_*
     */
    onAddEntryMode (mode) {
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

          if (mode === MODE_ADD_SUBMERGED_OBJECT) {
            icon = submergedObjectMarkerIcon
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

    /**
     * Добавление места
     */
    async addDiveSite () {
      const { diveSite } = await request(
        this.$axios,
        'divesite_addDiveSite',
        {
          title: this.editableDiveSite.title,
          description: this.editableDiveSite.description,
          location: this.tempMarker.marker.getLatLng()
        }
      )

      L
        .marker(
          diveSite.point.location,
          {
            icon: diveSiteMarkerIcon
          }
        )
        .bindTooltip(diveSite.title)
        .addTo(this.map)

      this.editableDiveSite = _.cloneDeep(DIVE_SITE_STUB)

      this.offAddEntryMode()
    },

    async addSubmergedObject () {
      const { submergedObject } = await request(
        this.$axios,
        'submergedObject_addSubmergedObject',
        {
          title: this.editableSubmergedObject.title,
          description: this.editableSubmergedObject.description,
          point: this.tempMarker.marker.getLatLng()
        }
      )

      L
        .marker(
          submergedObject.point.location,
          {
            icon: submergedObjectMarkerIcon
          }
        )
        .bindTooltip(submergedObject.title)
        .addTo(this.map)

      this.editableSubmergedObject = _.cloneDeep(SUBMERGED_OBJECT_STUB)

      this.offAddEntryMode()
    },

    async addCourse () {
      const { course } = await request(
        this.$axios,
        'course_addCourse',
        {
          title: this.editableCourse.title,
          description: this.editableCourse.description,
          direction: this.editableCourse.direction,
          points: this.tempPolyline.markers.map(marker => marker.getLatLng())
        }
      )

      course.points.forEach((point, index) => {
        const icon = index === 0 ? courseMarkerIconA : courseMarkerIconB

        L
          .marker(
            point.location,
            {
              icon
            }
          )
          .bindTooltip(course.title)
          .addTo(this.map)
      })

      const points = course.points.map(point => point.location)

      L.polyline(points).addTo(this.map)

      this.editableCourse = _.cloneDeep(COURSE_STUB)

      this.offAddEntryMode()
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
