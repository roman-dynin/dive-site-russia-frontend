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
          <v-btn
            :href="`${$axios.defaults.baseURL}/auth/vkontakte`"
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
    <!-- Панель для просмотра метки -->
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
        <v-chip
          disabled
          outlined
          label
        >
          {{ PLACEMARK_TYPES_MAP[placemark.type].text }}
        </v-chip>
        <div class="text-h6 mt-4">
          {{ placemark.title }}
        </div>
        <div
          v-if="placemark.description && placemark.description.length"
          class="mt-4"
        >
          {{ placemark.description }}
        </div>
        <div class="caption mt-4">
          Координаты: {{ placemark.location.lat }}, {{ placemark.location.lng }}
        </div>
        <v-btn
          v-if="$auth.loggedIn"
          block
          depressed
          class="mt-4"
          @click="editPlacemark"
        >
          Редактировать
        </v-btn>
        <v-btn
          v-if="$auth.loggedIn"
          block
          depressed
          outlined
          color="warning"
          class="mt-4"
          @click="deletePlacemark"
        >
          Удалить ({{ placemarkDeleteConfirmationCount }})
        </v-btn>
      </template>
    </v-navigation-drawer>
    <!-- Панель для добавления / редактирования метки -->
    <v-navigation-drawer
      v-model="editableEntryDrawer"
      :bottom="$vuetify.breakpoint.smAndDown"
      app
      clipped
      width="500px"
      class="pa-4 z-index--fix"
    >
      <!-- Добавление / редактирование метки -->
      <template v-if="interactionMode === INTERACTION_MODE.EDIT_PLACEMARK">
        <div class="text-h6 mb-4">
          Добавление метки
        </div>
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
      <v-toolbar-title>diving.place</v-toolbar-title>
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
        <div
          v-if="geolocation"
          class="map-actions map-actions--top map-actions--right pa-4 z-index--fix"
        >
          <v-btn
            small
            depressed
            @click="getCurrentPosition"
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
        <!-- Добавление метки -->
        <div
          v-if="$auth.loggedIn && interactionMode === INTERACTION_MODE.VIEW"
          class="map-actions map-actions--bottom pa-4 z-index--fix"
        >
          <!-- Добавление метки -->
          <v-btn
            small
            depressed
            class="mr-4"
            @click="addEntry(INTERACTION_MODE.EDIT_PLACEMARK)"
          >
            Добавить метку
            <v-icon
              small
              class="ml-2"
            >
              mdi-map-marker-down
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
    <!-- Сообщения -->
    <Snackbar />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'

import _ from 'lodash'

import L from 'leaflet'

import type {
  Placemark,
  SnackbarData
} from '~/types'

import {
  INTERACTION_MODE,
  VIEW_MODE,
  PLACEMARK_TYPE,
  PLACEMARK_TYPES,
  PLACEMARK_STUB,
  DELETE_CONFIRMATION_COUNT
} from '~/libs/constants'

import {
  request
} from '~/libs/jsonrpc'

import {
  placemarkDiveClub,
  placemarkDiveSite,
  placemarkMisc,
  placemarkShore,
  placemarkSubmergedObject
} from '~/libs/icons'

import Snackbar from '~/components/Snackbar.vue'

export default Vue.extend({
  components: {
    Snackbar
  },

  data () {
    return {
      // Режимы взаимодействия
      INTERACTION_MODE,

      // Режим взаимодействия
      interactionMode: INTERACTION_MODE.VIEW,

      // Режимы просмотра
      VIEW_MODE,

      // Режим просмотра
      viewMode: undefined as unknown as VIEW_MODE,

      // Карта
      map: undefined as unknown as L.Map,

      // Координаты центра карты по умолчанию
      mapCenter: [
        53.2613934,
        34.395868
      ] as L.LatLngTuple,

      // Масштаб карты по умолчанию
      mapZoom: 10 as number,

      // Масштаб карты при просмотре метки или курса
      mapEntryZoom: 18 as number,

      // Диалог авторизации
      authDialog: false as boolean,

      // Панель для просмотра метки или курса
      entryDrawer: false as boolean,

      // Панель для работы с меткой или курсом
      editableEntryDrawer: false as boolean,

      // Типы метки
      PLACEMARK_TYPES,

      // Типы метки
      PLACEMARK_TYPES_MAP: _.keyBy(PLACEMARK_TYPES, 'value'),

      // Метка
      placemark: undefined as unknown as Placemark,

      // Копия метки (для отмены редактирования)
      placemarkBackup: undefined as unknown as Placemark,

      // Счётчик для подтверждения удаления метки
      placemarkDeleteConfirmationCount: DELETE_CONFIRMATION_COUNT,

      // Маркер метки (для работы)
      draggablePlacemarkMarker: undefined as unknown as L.Marker,

      // Маркер метки
      placemarkMarker: undefined as unknown as L.Marker,

      // Слой маркеров меток
      placemarksLayerGroup: new L.LayerGroup(),

      // Геолокация доступна?
      geolocation: false
    }
  },

  async mounted () {
    // Авторизация
    if (!this.$auth.loggedIn && this.$route.query.token !== undefined) {
      const token: string = Buffer.from(this.$route.query.token.toString(), 'base64').toString()

      // TODO: Проверять token
      await this.$auth.setUserToken(token)

      // TODO: Не подтягивается тип для this.$router
      await this.$router.replace({
        query: {
          token: undefined
        }
      })
    }

    // Карта
    this.map = new L
      .Map(
        'map',
        {
          zoomControl: false
        }
      )
      .setView(this.mapCenter, this.mapZoom)

    // Слой OSM

    const OSMLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

    this.map.addLayer(OSMLayer)

    // Слой меток
    this.map.addLayer(this.placemarksLayerGroup)

    this.$nextTick(async () => {
      this.$nuxt.$loading.start()

      // Получение и отрисовка меток

      const placemarks = await request(
        this.$axios,
        'placemark_getPlacemarks',
        {},
        'placemarks'
      ) as Placemark[]

      placemarks.forEach((placemark: Placemark) => this.drawPlacemark(placemark))

      this.$nuxt.$loading.finish()
    })

    // Проверка доступности геолокации
    this.geolocation = !!navigator.geolocation
  },

  methods: {
    /**
     * Добавление метки
     */
    addEntry (interactionMode: INTERACTION_MODE): void {
      this.interactionMode = INTERACTION_MODE.DRAW

      L.DomUtil.addClass(this.map.getContainer(), 'cursor--crosshair')

      this.map.on('click', (event: L.LeafletMouseEvent) => this.getAddEntryHandler(interactionMode, event.latlng))
    },

    /**
     * Получение обработчика клика по карте
     */
    getAddEntryHandler (interactionMode: INTERACTION_MODE, latlng: L.LatLng): void {
      switch (interactionMode) {
        case INTERACTION_MODE.EDIT_PLACEMARK:
          return this.addPlacemarkHandler(interactionMode, latlng)
        default:
          throw new Error('Invalid interaction mode')
      }
    },

    /**
     * Обработчик клика по карте в режиме добавления метки
     */
    addPlacemarkHandler (interactionMode: INTERACTION_MODE, latlng: L.LatLng): void {
      this.map.off('click')

      L.DomUtil.removeClass(this.map.getContainer(), 'cursor--crosshair')

      const placemark = _.cloneDeep(PLACEMARK_STUB)

      placemark.location.lat = latlng.lat

      placemark.location.lng = latlng.lng

      this.placemark = placemark

      this.drawDraggablePlacemark(this.placemark)

      this.map.setView(latlng, this.mapEntryZoom)

      this.interactionMode = interactionMode

      this.editableEntryDrawer = true
    },

    /**
     * Отрисовка маркера для работы меткой
     */
    drawDraggablePlacemark (placemark: Placemark): void {
      this.draggablePlacemarkMarker = new L
        .Marker(
          new L.LatLng(
            placemark.location.lat as number,
            placemark.location.lng as number
          ),
          {
            icon: this.getPlacemarkIcon(placemark),
            draggable: true
          }
        )
        .on('move', () => {
          placemark.location = this.draggablePlacemarkMarker.getLatLng()
        })

      this.placemarksLayerGroup.addLayer(this.draggablePlacemarkMarker)
    },

    /**
     * Получение иконки для маркера метки
     */
    getPlacemarkIcon (placemark: Placemark): L.Icon {
      switch (placemark.type) {
        case PLACEMARK_TYPE.MISC:
          return L.icon(placemarkMisc)
        case PLACEMARK_TYPE.DIVE_CLUB:
          return L.icon(placemarkDiveClub)
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
          this.placemarkMarker = marker

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

      this.$nuxt.$emit('snackbar:show', {
        color: 'success',
        text: 'Готово! 🙂'
      } as SnackbarData)
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

      this.placemarkDeleteConfirmationCount = DELETE_CONFIRMATION_COUNT

      this.viewMode = VIEW_MODE.PLACEMARK

      this.entryDrawer = true

      this.$nuxt.$loading.finish()
    },

    /**
     * Редактирование метки
     */
    editPlacemark (): void {
      this.$nuxt.$loading.start()

      this.interactionMode = INTERACTION_MODE.EDIT_PLACEMARK

      this.editableEntryDrawer = true

      this.placemarksLayerGroup.removeLayer(this.placemarkMarker)

      this.drawDraggablePlacemark(this.placemark)

      this.map.setView(this.placemark.location as L.LatLng, this.mapEntryZoom)

      this.placemarkBackup = _.cloneDeep(this.placemark)

      this.$nuxt.$loading.finish()
    },

    /**
     * Отмена редактирования метки
     */
    undoEditPlacemark (): void {
      this.$nuxt.$loading.start()

      this.interactionMode = INTERACTION_MODE.VIEW

      this.editableEntryDrawer = false

      this.placemarksLayerGroup.removeLayer(this.draggablePlacemarkMarker)

      this.drawPlacemark(this.placemark)

      this.placemark = _.cloneDeep(this.placemarkBackup)

      this.$nuxt.$loading.finish()
    },

    /**
     * Удаление метки
     */
    async deletePlacemark (): Promise<void> {
      if (this.placemarkDeleteConfirmationCount !== 0) {
        this.placemarkDeleteConfirmationCount -= 1

        return
      }

      this.$nuxt.$loading.start()

      await request(
        this.$axios,
        'placemark_deletePlacemarkById',
        {
          id: this.placemark.id
        },
        null
      )

      this.interactionMode = INTERACTION_MODE.VIEW

      this.entryDrawer = false

      this.editableEntryDrawer = false

      this.placemarksLayerGroup.removeLayer(this.placemarkMarker)

      this.placemarksLayerGroup.removeLayer(this.draggablePlacemarkMarker)

      this.map.setView(this.placemark.location as L.LatLng, this.mapEntryZoom)

      this.$nuxt.$loading.finish()

      this.$nuxt.$emit('snackbar:show', {
        color: 'success',
        text: 'Готово! 🙂'
      } as SnackbarData)
    },

    getCurrentPosition (): void {
      this.$nuxt.$emit('snackbar:show', {
        color: 'info',
        text: 'Ищем вас ... 🙂'
      } as SnackbarData)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.map.setView(new L.LatLng(position.coords.latitude, position.coords.longitude), this.mapZoom)
        },
        () => {
          this.$nuxt.$emit('snackbar:show', {
            color: 'error',
            text: 'Не получилось найти вас 😢'
          } as SnackbarData)
        }
      )
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
