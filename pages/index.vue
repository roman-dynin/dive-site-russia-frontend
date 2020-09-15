<template>
  <v-app>
    <!-- Диалог авторизации -->
    <v-dialog
      v-model="authDialog"
      max-width="500px"
      class="z-index--fix"
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
    <!-- Панель для просмотра метки / курса -->
    <v-navigation-drawer
      v-model="entryDrawer"
      :bottom="$vuetify.breakpoint.smAndDown"
      app
      clipped
      right
      width="500px"
      class="pa-4 z-index--fix"
    >
      <template v-if="viewMode === VIEW_MODE.PLACEMARK">
        <div class="mb-4 text-h6">
          {{ placemark.title }}
        </div>
        <div class="mb-4">
          {{ placemark.description }}
        </div>
        <div class="mb-4 caption">
          {{ placemark.location.lat }}, {{ placemark.location.lng }}
        </div>
        <v-btn
          block
          depressed
          @click="editPlacemark"
        >
          Редактировать
        </v-btn>
      </template>
      <template v-if="viewMode === VIEW_MODE.COURSE">
        <div class="mb-4 text-h6">
          {{ course.title }}
        </div>
        <div class="mb-4">
          {{ course.description }}
        </div>
        <v-btn
          block
          depressed
          @click="editCourse"
        >
          Редактировать
        </v-btn>
      </template>
    </v-navigation-drawer>
    <!-- Панель для добавления / редактирования метки / курса -->
    <v-navigation-drawer
      v-model="entryManagerDrawer"
      :bottom="$vuetify.breakpoint.smAndDown"
      app
      clipped
      width="500px"
      class="pa-4 z-index--fix"
    >
      <!-- Добавление / редактирование метки -->
      <template v-if="interactionMode === INTERACTION_MODE.MANAGE_PLACEMARK && placemark">
        <h1 class="mb-4 text-h6">
          Добавление метки
        </h1>
        <v-select
          v-model="placemark.type"
          :items="PLACEMARK_TYPES"
          filled
          label="Тип"
          @input="onChangePlacemarkTypeHandler"
        />
        <v-text-field
          v-model.trim="placemark.title"
          filled
          label="Название"
        />
        <v-textarea
          v-model.trim="placemark.description"
          filled
          label="Описание"
        />
        <v-btn
          block
          depressed
          color="primary"
          class="mb-4"
          @click="savePlacemark"
        >
          Сохранить
        </v-btn>
        <v-btn
          block
          depressed
          @click="undoEditPlacemark"
        >
          Отмена
        </v-btn>
      </template>
      <template v-if="interactionMode === INTERACTION_MODE.MANAGE_COURSE && course">
        <h1 class="mb-4 text-h6">
          Добавление курса
        </h1>
        <v-text-field
          v-model.trim="course.title"
          filled
          label="Название"
        />
        <v-textarea
          v-model.trim="course.description"
          filled
          label="Описание"
        />
        <v-text-field
          v-model.trim="course.direction"
          filled
          type="number"
          label="Направление"
        />
        <v-btn
          block
          depressed
          color="primary"
          class="mb-4"
          @click="saveCourse"
        >
          Сохранить
        </v-btn>
        <v-btn
          block
          depressed
          @click="undoEditCourse"
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
        depressed
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
        depressed
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
        <div class="map-actions map-actions--top map-actions--right pa-4 z-index--fix">
          <v-btn
            small
            depressed
          >
            <v-icon small>
              mdi-crosshairs-gps
            </v-icon>
          </v-btn>
        </div>
        <!-- Изменение масштаба карты -->
        <div class="map-actions map-actions--top pa-4 z-index--fix">
          <v-btn-toggle small>
            <v-btn
              small
              depressed
              @click="map.zoomIn()"
            >
              <v-icon small>
                mdi-plus
              </v-icon>
            </v-btn>
            <v-btn
              small
              depressed
              @click="map.zoomOut()"
            >
              <v-icon small>
                mdi-minus
              </v-icon>
            </v-btn>
          </v-btn-toggle>
        </div>
        <!-- Добавление метки / курса -->
        <div
          v-if="$auth.loggedIn && interactionMode === INTERACTION_MODE.VIEW"
          class="map-actions map-actions--bottom pa-4 z-index--fix"
        >
          <!-- Добавление метки -->
          <v-btn
            small
            depressed
            class="mr-4"
            @click="addEntry(INTERACTION_MODE.MANAGE_PLACEMARK)"
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
            small
            depressed
            class="mr-4"
            @click="addEntry(INTERACTION_MODE.MANAGE_COURSE)"
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

<script lang="ts">
import Vue from 'vue'

import _ from 'lodash'

import L from 'leaflet'

import {
  Course, Location,
  Placemark,
  TempCourseGeometry
} from '~/types'

import {
  INTERACTION_MODE,
  PLACEMARK_STUB,
  PLACEMARK_TYPE,
  PLACEMARK_TYPES,
  COURSE_STUB,
  VIEW_MODE
} from '~/libs/constants'

import {
  request
} from '~/libs/jsonrpc'

import {
  placemarkDiveSite,
  placemarkMisc,
  placemarkShore,
  placemarkSubmergedObject
} from '~/libs/icons'

export default Vue.extend({
  data () {
    return {
      /**
       * Режимы взаимодействия
       */
      INTERACTION_MODE,

      /**
       * Режим взаимодействия
       */
      interactionMode: INTERACTION_MODE.VIEW,

      /**
       * Режимы просмотра
       */
      VIEW_MODE,

      /**
       * Режим просмотра
       */
      viewMode: undefined as unknown as VIEW_MODE,

      /**
       * Карта
       */
      map: undefined as unknown as L.Map,

      /**
       * Координаты центра карты по умолчанию
       */
      mapCenter: [
        53.4367995,
        34.2885255
      ] as L.LatLngTuple,

      /**
       * Масштаб карты по умолчанию
       */
      mapZoom: 12 as number,

      /**
       * Масштаб карты при просмотре метки или курса
       */
      mapEntryZoom: 18 as number,

      /**
       * Маркер для работы с меткой
       */
      draggablePlacemarkMarker: undefined as unknown as L.Marker,

      /**
       * Маркеры и линия для работы с курсом
       */
      draggableCourse: undefined as unknown as TempCourseGeometry,

      /**
       * Слой маркеров меток
       */
      placemarksLayerGroup: new L.LayerGroup(),

      /**
       * Слой маркеров и линий курсов
       */
      coursesLayerGroup: new L.LayerGroup(),

      /**
       * Слой маркеров для работы с метками, маркеров и линий для работы с курсами
       */
      draggableLayerGroup: new L.LayerGroup(),

      /**
       * Диалог авторизации
       */
      authDialog: false as boolean,

      /**
       * Панель для просмотра метки или курса
       */
      entryDrawer: false as boolean,

      /**
       * Панель для работы с меткой или курсом
       */
      entryManagerDrawer: false as boolean,

      /**
       * Типы метки
       */
      PLACEMARK_TYPES,

      /**
       * Метка
       */
      placemark: undefined as unknown as Placemark,

      /**
       * Копия метки (для отмены редактирования)
       */
      placemarkBackup: undefined as unknown as Placemark,

      /**
       * Курс
       */
      course: undefined as unknown as Course,

      /**
       * Копия курса (для отмены редактирования)
       */
      courseBackup: undefined as unknown as Course
    }
  },

  async mounted () {
    /**
     * Авторизация
     */
    if (this.$route.query.token && !this.$auth.loggedIn) {
      const token: string = Buffer.from(this.$route.query.token.toString(), 'base64').toString()

      await this.$auth.setUserToken(token)

      // TODO: Почему не подтягивается тип?
      await this.$router.replace({
        query: {
          token: undefined
        }
      })
    }

    /**
     * Карта
     */
    this.map = new L
      .Map(
        'map',
        {
          zoomControl: false
        }
      )
      .setView(this.mapCenter, this.mapZoom)

    this.map.addLayer(this.placemarksLayerGroup)

    /**
     * Слой OSM
     */
    const OSMLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

    this.map.addLayer(OSMLayer)

    /**
     * Получение меток и курсов
     */
    const promises = [
      request(
        this.$axios,
        'placemark_getPlacemarks',
        {},
        'placemarks'
      ),
      request(
        this.$axios,
        'course_getCourses',
        {},
        'courses'
      )
    ]

    const results = await Promise.all(promises)

    /**
     * Отрисовка меткок
     */
    const placemarks = results[0] as Placemark[]

    placemarks.forEach((placemark: Placemark) => this.drawPlacemark(placemark))

    /**
     * Отрисовка курсов
     */
    const courses = results[1] as Course[]

    courses.forEach((course: Course) => this.drawCourse(course))
  },

  methods: {
    /**
     * Добавление метки или курса
     */
    addEntry (interactionMode: INTERACTION_MODE): void {
      this.interactionMode = INTERACTION_MODE.DRAW

      L.DomUtil.addClass(this.map.getContainer(), 'cursor--crosshair')

      this.map.on('click', (event: L.LeafletMouseEvent) => this.getAddEntryMapHandler(interactionMode, event.latlng))
    },

    /**
     * Получение обработчика клика по карте при добавлении метки или курса
     */
    getAddEntryMapHandler (interactionMode: INTERACTION_MODE, latlng: L.LatLng): void {
      switch (interactionMode) {
        case INTERACTION_MODE.MANAGE_PLACEMARK:
          return this.addPlacemarkMapHandler(interactionMode, latlng)
        case INTERACTION_MODE.MANAGE_COURSE:
          return this.addCourseMapHandler(interactionMode, latlng)
        default:
          throw new Error('Invalid interaction mode')
      }
    },

    /**
     * Обработчик клика по карте при добавления метки
     */
    addPlacemarkMapHandler (interactionMode: INTERACTION_MODE, latlng: L.LatLng): void {
      this.map.off('click')

      L.DomUtil.removeClass(this.map.getContainer(), 'cursor--crosshair')

      this.placemark = _.cloneDeep(PLACEMARK_STUB)

      this.drawDraggablePlacemark(this.placemark, latlng)

      this.map.setView(latlng, this.mapEntryZoom)

      this.interactionMode = interactionMode

      this.entryManagerDrawer = true
    },

    /**
     * Обработчик клика по карте при добавлении курса
     */
    addCourseMapHandler (interactionMode: INTERACTION_MODE, latlng: L.LatLng): void {
      if (!this.draggableCourse) {
        this.course = _.cloneDeep(COURSE_STUB)

        this.draggableCourse = {
          markers: [],
          polyline: new L.Polyline([latlng])
        }

        const marker = this.getDraggableCourseMarker(latlng, 0)

        this.draggableCourse.markers.push(marker)

        this.draggableLayerGroup.addLayer(marker)

        return
      }

      this.map.off('click')

      L.DomUtil.removeClass(this.map.getContainer(), 'cursor--crosshair')

      const marker = this.getDraggableCourseMarker(latlng, 1)

      this.draggableCourse.markers.push(marker)

      this.draggableLayerGroup.addLayer(marker)

      this.draggableCourse.polyline.addLatLng(latlng)

      this.draggableLayerGroup.addLayer(this.draggableCourse.polyline)

      this.interactionMode = interactionMode

      this.entryManagerDrawer = true
    },

    /**
     * Получение маркера для работы с курсом
     */
    getDraggableCourseMarker (latlng: L.LatLng, index: number): L.Marker {
      const marker = new L
        .Marker(
          latlng,
          {
            draggable: true
          }
        )
        .on('add move', () => {
          this.course.locations[index] = marker.getLatLng()
        })
        .on('move', () => {
          const latlngs = this.draggableCourse.markers.map((marker: L.Marker) => marker.getLatLng())

          this.draggableCourse.polyline.setLatLngs(latlngs)
        })

      return marker
    },

    /**
     * Отрисовка маркеров и линии для работы с курсом
     */
    drawDraggableCourse (course: Course): void {
      const latlngs = course.locations.map((location: Location) => new L.LatLng(
        location.lat as number,
        location.lng as number
      ))

      this.draggableCourse = {
        markers: [],
        polyline: new L.Polyline(latlngs)
      }

      this.draggableLayerGroup.addLayer(this.draggableCourse.polyline)

      latlngs.forEach((latlng: L.LatLng, index: number) => {
        const marker = this.getDraggableCourseMarker(latlng, index)

        this.draggableCourse.markers.push(marker)

        this.draggableLayerGroup.addLayer(marker)
      })
    },

    /**
     * Отрисовка маркера для работы меткой
     */
    drawDraggablePlacemark (placemark: Placemark, latlng?: L.LatLng): void {
      this.draggablePlacemarkMarker = new L
        .Marker(
          latlng || new L.LatLng(
            placemark.location.lat as number,
            placemark.location.lng as number
          ),
          {
            icon: this.getPlacemarkIcon(placemark),
            draggable: true
          }
        )
        .on('add move', () => {
          placemark.location = this.draggablePlacemarkMarker.getLatLng()
        })

      this.draggableLayerGroup.addLayer(this.draggablePlacemarkMarker)
    },

    /**
     * Получение иконки для маркера метки
     */
    getPlacemarkIcon (placemark: Placemark): L.Icon {
      switch (placemark.type) {
        case PLACEMARK_TYPE.MISC:
          return L.icon(placemarkMisc)
        case PLACEMARK_TYPE.DIVE_SITE:
          return L.icon(placemarkDiveSite)
        case PLACEMARK_TYPE.SHORE:
          return L.icon(placemarkShore)
        case PLACEMARK_TYPE.SUBMERGED_OBJECT:
          return L.icon(placemarkSubmergedObject)
        default:
          throw new Error('Invalid placemark type')
      }
    },

    /**
     * Обработчик изменения типа метки
     */
    onChangePlacemarkTypeHandler (): void {
      this.draggablePlacemarkMarker.setIcon(this.getPlacemarkIcon(this.placemark))
    },

    /**
     * Отрисовка метки
     */
    drawPlacemark (placemark: Placemark): void {
      const marker = new L
        .Marker(
          new L.LatLng(
            placemark.location.lat as number,
            placemark.location.lng as number
          ),
          {
            icon: this.getPlacemarkIcon(placemark)
          }
        )
        .bindTooltip(placemark.title)
        .on('click', () => {
          this.viewPlacemark(placemark.id as number)
        })

      this.placemarksLayerGroup.addLayer(marker)
    },

    /**
     * Сохранение метки
     */
    async savePlacemark (): Promise<void> {
      this.$nuxt.$loading.start()

      this.placemark = await request(
        this.$axios,
        `placemark_${this.placemark.id ? 'updatePlacemarkById' : 'addPlacemark'}`,
        this.placemark,
        'placemark'
      ) as Placemark

      this.placemarkBackup = _.cloneDeep(this.placemark)

      this.$nuxt.$loading.finish()
    },

    /**
     * Просмотр метки
     */
    async viewPlacemark (id: number): Promise<void> {
      this.$nuxt.$loading.start()

      this.placemark = await request(
        this.$axios,
        'placemark_getPlacemarkById',
        {
          id
        },
        'placemark'
      ) as Placemark

      this.viewMode = VIEW_MODE.PLACEMARK

      this.entryDrawer = true

      this.$nuxt.$loading.finish()
    },

    /**
     * Редактирование метки
     */
    editPlacemark (): void {
      this.interactionMode = INTERACTION_MODE.MANAGE_PLACEMARK

      this.entryManagerDrawer = true

      // TODO: Удаление основной метки

      this.drawDraggablePlacemark(this.placemark)

      this.placemarkBackup = _.cloneDeep(this.placemark)
    },

    /**
     * Отмена редактирования метки
     */
    undoEditPlacemark (): void {
      this.draggableLayerGroup.removeLayer(this.draggablePlacemarkMarker)

      this.placemark = _.cloneDeep(this.placemarkBackup)

      this.drawPlacemark(this.placemark)

      this.interactionMode = INTERACTION_MODE.VIEW

      this.entryManagerDrawer = false
    },

    /**
     * Отрисовка курса
     */
    drawCourse (course: Course): void {
      const latlngs = course.locations.map((location: Location) => new L.LatLng(
        location.lat as number,
        location.lng as number
      ))

      const layerGroup = new L.LayerGroup()

      layerGroup.course_id = course.id

      latlngs.forEach((latlng) => {
        const marker = new L
          .Marker(
            latlng,
            {
            }
          )
          .bindTooltip(course.title)
          .on('click', () => {
            this.viewCourse(course.id as number)
          })

        layerGroup.addLayer(marker)
      })

      const polyline = new L.Polyline(latlngs)

      layerGroup.addLayer(polyline)

      this.coursesLayerGroup.addLayer(layerGroup)
    },

    /**
     * Сохранение курса
     */
    async saveCourse (): Promise<void> {
      this.$nuxt.$loading.start()

      this.course = await request(
        this.$axios,
        `course_${this.course.id ? 'updateCourseById' : 'addCourse'}`,
        this.course,
        'course'
      ) as Placemark

      this.courseBackup = _.cloneDeep(this.course) as Course

      this.$nuxt.$loading.finish()
    },

    /**
     * Просмотр курса
     */
    async viewCourse (id: number): void {
      this.$nuxt.$loading.start()

      this.course = await request(
        this.$axios,
        'course_getCourseById',
        {
          id
        },
        'course'
      ) as Course

      this.viewMode = VIEW_MODE.COURSE

      this.entryDrawer = true

      this.$nuxt.$loading.finish()
    },

    /**
     * Редактирование курса
     */
    editCourse (): void {
      this.interactionMode = INTERACTION_MODE.MANAGE_COURSE

      this.entryManagerDrawer = true

      this.map.eachLayer((layer) => {
        if (layer.course_id === this.course.id) {
          this.map.removeLayer(layer)
        }
      })

      this.drawDraggableCourse(this.course)

      this.courseBackup = _.cloneDeep(this.course) as Course
    },

    /**
     * Отмена редактирования курса
     */
    undoEditCourse (): void {
      this.placemarksLayerGroup.removeLayer(this.draggableCourse.polyline)

      this.draggableCourse.markers.forEach((marker) => this.placemarksLayerGroup.removeLayer(marker))

      this.draggableCourse = undefined

      this.course = _.cloneDeep(this.courseBackup) as Course

      this.courseBackup = undefined

      this.drawCourse(this.course)

      this.interactionMode = INTERACTION_MODE.VIEW

      this.entryManagerDrawer = false
    }
  },

  head () {
    return {
      title: 'diving-map.io'
    }
  }
})
</script>

<style lang="css">
@import 'node_modules/leaflet/dist/leaflet.css';

.z-index--fix
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
