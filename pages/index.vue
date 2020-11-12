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
    <!-- Панель метки -->
    <v-bottom-sheet
      v-model="placemarkBottomSheet"
      :retain-focus="false"
      :width="`${$placemarkBottomSheetWidthPercents}%`"
      persistent
      no-click-animation
      scrollable
      inset
      hide-overlay
      class="z-index--fix"
    >
      <v-card
        v-if="placemark"
        :height="`${$placemarkBottomSheetHeightPixels}px`"
        flat
        tile
      >
        <v-card-title
          v-touch="{
            down: onPlacemarkBottomSheetTouch
          }"
          class="pa-4"
        >
          <v-row
            justify="space-between"
            no-gutters
          >
            <v-col cols="auto">
              <template v-if="placemark.title">
                {{ placemark.title }}
              </template>
              <span
                v-else
                class="grey--text"
              >
                Без названия
              </span>
            </v-col>
            <v-col cols="auto">
              <v-tooltip
                v-if="interactionMode === INTERACTION_MODE.VIEW_PLACEMARK"
                top
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="$auth.loggedIn"
                    :small="$vuetify.breakpoint.mdAndUp"
                    icon
                    color="info"
                    class="mr-4"
                    v-bind="attrs"
                    v-on="on"
                    @click="editPlacemark"
                  >
                    <v-icon :small="$vuetify.breakpoint.mdAndUp">
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                </template>
                <span>Редактировать</span>
              </v-tooltip>
              <v-tooltip
                v-if="interactionMode === INTERACTION_MODE.EDIT_PLACEMARK && placemark.id"
                top
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="$auth.loggedIn"
                    :small="$vuetify.breakpoint.mdAndUp"
                    icon
                    color="info"
                    class="mr-4"
                    v-bind="attrs"
                    v-on="on"
                    @click="undoEditPlacemark"
                  >
                    <v-icon :small="$vuetify.breakpoint.mdAndUp">
                      mdi-pencil-remove
                    </v-icon>
                  </v-btn>
                </template>
                <span>Отменить редактирование</span>
              </v-tooltip>
              <v-tooltip
                v-if="placemark.id"
                top
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="$auth.loggedIn"
                    :small="$vuetify.breakpoint.mdAndUp"
                    icon
                    color="warning"
                    class="mr-4"
                    v-bind="attrs"
                    v-on="on"
                    @click="deletePlacemark"
                  >
                    <v-icon :small="$vuetify.breakpoint.mdAndUp">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </template>
                <span>Удалить</span>
              </v-tooltip>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    :small="$vuetify.breakpoint.mdAndUp"
                    icon
                    v-bind="attrs"
                    v-on="on"
                    @click="closePlacemark"
                  >
                    <v-icon :small="$vuetify.breakpoint.mdAndUp">
                      mdi-close
                    </v-icon>
                  </v-btn>
                </template>
                <span>Закрыть</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <template v-if="interactionMode === INTERACTION_MODE.VIEW_PLACEMARK">
            <div
              v-if="placemark.description"
              class="mb-4"
            >
              {{ placemark.description }}
            </div>
            <v-chip
              :small="$vuetify.breakpoint.mdAndUp"
              :color="PLACEMARK_TYPES_MAP[placemark.type].color"
              disabled
              outlined
              label
              class="mb-4"
            >
              {{ PLACEMARK_TYPES_MAP[placemark.type].text }}
            </v-chip>
            <div
              :class="{
                caption: $vuetify.breakpoint.mdAndUp
              }"
              class="mb-4"
            >
              <v-icon :small="$vuetify.breakpoint.mdAndUp">
                mdi-compass-outline
              </v-icon>
              {{ placemark.location.lat }}, {{ placemark.location.lng }}
            </div>
            <!--
            <div
              :class="{
                caption: $vuetify.breakpoint.mdAndUp
              }"
              class="mb-4"
             >
              <v-icon :small="$vuetify.breakpoint.mdAndUp">
                mdi-swap-vertical
              </v-icon>
              м.
            </div>
            -->
            <div
              :class="{
                caption: $vuetify.breakpoint.mdAndUp
              }"
              class="mb-4"
            >
              <v-icon :small="$vuetify.breakpoint.mdAndUp">
                mdi-account
              </v-icon>
              {{ placemark.user.nickname }}
            </div>
            <div
              :class="{
                caption: $vuetify.breakpoint.mdAndUp
              }"
              class="mb-4"
            >
              <v-icon :small="$vuetify.breakpoint.mdAndUp">
                mdi-calendar-range
              </v-icon>
              {{ placemark.created_at }}
            </div>
          </template>
          <template v-if="interactionMode === INTERACTION_MODE.EDIT_PLACEMARK">
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
          </template>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
    <!-- Шапка -->
    <v-app-bar
      app
      dense
      flat
      dark
    >
      <v-icon class="mr-2">
        mdi-diving-scuba
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
      <!-- Карта -->
      <div
        id="map"
        class="fill-height"
      />
      <!-- Поиск местоположения пользователя -->
      <div class="map-actions map-actions--top map-actions--right pa-4 z-index--fix">
        <v-btn
          :small="$vuetify.breakpoint.mdAndUp"
          depressed
          @click="getCurrentPosition"
        >
          <v-icon :small="$vuetify.breakpoint.mdAndUp">
            mdi-crosshairs-gps
          </v-icon>
        </v-btn>
      </div>
      <!-- Изменение масштаба карты -->
      <div class="map-actions map-actions--top pa-4 z-index--fix">
        <v-btn
          :small="$vuetify.breakpoint.mdAndUp"
          depressed
          @click="map.zoomOut()"
        >
          <v-icon :small="$vuetify.breakpoint.mdAndUp">
            mdi-minus
          </v-icon>
        </v-btn>
        <v-btn
          :small="$vuetify.breakpoint.mdAndUp"
          depressed
          @click="map.zoomIn()"
        >
          <v-icon :small="$vuetify.breakpoint.mdAndUp">
            mdi-plus
          </v-icon>
        </v-btn>
      </div>
      <!-- Добавление метки -->
      <div
        v-if="$auth.loggedIn && interactionMode === INTERACTION_MODE.VIEW_MAP"
        class="map-actions map-actions--bottom pa-4 z-index--fix"
      >
        <!-- Добавление метки -->
        <v-btn
          :small="$vuetify.breakpoint.mdAndUp"
          depressed
          class="mr-4"
          @click="addEntry(INTERACTION_MODE.EDIT_PLACEMARK)"
        >
          Добавить метку
          <v-icon
            :small="$vuetify.breakpoint.mdAndUp"
            class="ml-2"
          >
            mdi-plus
          </v-icon>
        </v-btn>
      </div>
    </v-main>
    <!-- Подвал -->
    <v-footer
      app
      dark
      class="caption z-index--fix"
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

import 'leaflet.markercluster'

import type {
  Location,
  Placemark,
  PlacemarksMarkersReferencesMap,
  Query,
  SnackbarData,
  TouchEvent
} from '../types'

import {
  DELETE_CONFIRMATION_COUNT,
  INTERACTION_MODE,
  PLACEMARK_STUB,
  PLACEMARK_TYPE,
  PLACEMARK_TYPES
} from '../libs/constants'

import {
  request
} from '../libs/jsonrpc'

import {
  placemarkDiveClub,
  placemarkDiveSite,
  placemarkMisc,
  placemarkShore,
  placemarkSubmergedObject
} from '../libs/icons'

import Snackbar from '../components/Snackbar.vue'

export default Vue.extend({
  components: {
    Snackbar
  },

  data () {
    return {
      // Режимы взаимодействия
      INTERACTION_MODE,

      // Режим взаимодействия
      interactionMode: INTERACTION_MODE.VIEW_MAP,

      // Карта
      map: undefined as unknown as L.Map,

      // Центр карты по умолчанию (дайвинг-клуб Скат)
      mapDefaultCenter: [
        53.2613934,
        34.395868
      ] as L.LatLngTuple,

      // Предыдущий центр карты
      mapPreviousCenter: undefined as unknown as L.LatLng,

      // Масштаб карты по умолчанию
      mapDefaultZoom: 12 as number,

      // Предыдущий масштаб карты
      mapPreviousZoom: undefined as unknown as number,

      // Масштаб карты при просмотре метки
      mapPlacemarkZoom: 17 as number,

      // Масштаб карты при добавлении / редактировании метки
      mapEditablePlacemarkZoom: 18 as number,

      // Слой маркеров меток
      mapPlacemarksLayerGroup: new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: false,
        maxClusterRadius: 20
      }),

      // Типы метки
      PLACEMARK_TYPES,

      // Типы метки
      PLACEMARK_TYPES_MAP: _.keyBy(PLACEMARK_TYPES, 'value'),

      // Метка
      placemark: undefined as unknown as Placemark,

      // Копия метки (для сохранения состояния перед редактированием)
      placemarkBackup: undefined as unknown as Placemark,

      // Счётчик для подтверждения удаления метки
      placemarkDeleteConfirmationCount: DELETE_CONFIRMATION_COUNT,

      // Маркер метки
      placemarkMarker: undefined as unknown as L.Marker,

      // Ссылки на маркеры по ID метки
      placemarksMarkersReferences: {} as PlacemarksMarkersReferencesMap,

      // Редактируемый маркер метки
      placemarkDraggableMarker: undefined as unknown as L.Marker,

      // Панель метки
      placemarkBottomSheet: false as boolean,

      // Диалог авторизации
      authDialog: false as boolean,

      // Строка запроса
      query: {
        placemark_id: undefined,
        map_center: undefined,
        map_zoom: undefined
      } as Query
    }
  },

  computed: {
    /**
     * Ширина панели метки
     */
    $placemarkBottomSheetWidthPercents (): number {
      if (this.$vuetify.breakpoint.smAndDown) {
        return 100
      }

      if (this.$vuetify.breakpoint.mdAndDown) {
        return 40
      }

      return 30
    },

    /**
     * Высота панели метки
     */
    $placemarkBottomSheetHeightPixels (): number {
      switch (this.interactionMode) {
        case INTERACTION_MODE.EDIT_PLACEMARK:
          return 350
        default:
          return 300
      }
    }
  },

  watch: {
    /**
     * Метка
     */
    placemark (): void {
      this.query.placemark_id = this.placemark ? this.placemark.id as number : undefined
    },

    /**
     * Параметры запроса
     */
    query: {
      deep: true,
      handler (): void {
        this.$router.replace({
          query: this.query
        })
      }
    }
  },

  async mounted () {
    // Код для исправление проблемы с 100vh на моб. устройствах

    const calcVerticalHeight = (): void => {
      const vh = window.innerHeight * 0.01

      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    calcVerticalHeight()

    window.addEventListener('resize', () => calcVerticalHeight())

    window.addEventListener('orientationchange', () => calcVerticalHeight())

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
          maxZoom: 18,
          zoomControl: false,
          crs: L.CRS.EPSG3395
        }
      )
      .setView(this.mapDefaultCenter, this.mapDefaultZoom)

    this.map.on('zoomend', () => {
      this.query.map_zoom = this.map.getZoom()
    })

    this.map.on('moveend', () => {
      const mapCenter = this.map.getCenter() as L.LatLng

      this.query.map_center = `${mapCenter.lat},${mapCenter.lng}`
    })

    // Слой OSM

    // const OSMLayer = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')

    // this.map.addLayer(OSMLayer)

    // Слой Google (Гибридный)

    /*
    const GoogleHybridLayer = new L.TileLayer(
      'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        subdomains: [
          'mt0',
          'mt1',
          'mt2',
          'mt3'
        ]
      }
    )

    this.map.addLayer(GoogleHybridLayer)
    */

    // Слой Яндекс (Спутник + Карта)

    const YandexMapsSateliteLayer = new L.TileLayer(
      'http://sat{s}.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
      {
        subdomains: [
          '01',
          '02',
          '03',
          '04'
        ],
        attribution: '<a http="http://yandex.ru" target="_blank"><span style="color: red;">Я</span>ндекс</a>'
      }
    )

    this.map.addLayer(YandexMapsSateliteLayer)

    const YandexMapsMapLayer = new L.TileLayer(
      'http://vec{s}.maps.yandex.net/tiles?l=skl&x={x}&y={y}&z={z}&scale=1&lang=ru_RU',
      {
        subdomains: [
          '01',
          '02',
          '03',
          '04'
        ]
      }
    )

    this.map.addLayer(YandexMapsMapLayer)

    // Слой меток
    this.map.addLayer(this.mapPlacemarksLayerGroup)

    // Получение и отрисовка меток

    this.$nextTick(async () => {
      this.$nuxt.$loading.start()

      const placemarks = await request(
        this.$axios,
        'placemark_getPlacemarks',
        {},
        'placemarks'
      ) as Placemark[]

      placemarks.forEach((placemark: Placemark) => this.drawPlacemarkMarker(placemark))

      this.$nuxt.$loading.finish()

      this.processQuery(this.$route.query as Query)
    })
  },

  methods: {
    /**
     * Добавление метки
     */
    addEntry (interactionMode: INTERACTION_MODE): void {
      this.map.on('click', (event: L.LeafletMouseEvent) => this.getAddEntryHandler(interactionMode, event.latlng))

      L.DomUtil.addClass(this.map.getContainer(), 'cursor--crosshair')

      this.interactionMode = INTERACTION_MODE.DRAW_MAP

      this.$nuxt.$emit('snackbar:show', {
        color: 'success',
        text: 'Кликните по карте 👆'
      } as SnackbarData)
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

      const placemark = _.cloneDeep(PLACEMARK_STUB) as Placemark

      placemark.location = latlng as Location

      this.placemark = placemark

      this.drawDraggablePlacemarkMarker(this.placemark)

      this.mapPreviousCenter = this.map.getCenter() as L.LatLng

      this.mapPreviousZoom = this.map.getZoom()

      this.setViewWithOffset(placemark.location as L.LatLng, this.mapEditablePlacemarkZoom)

      this.interactionMode = interactionMode

      this.placemarkBottomSheet = true
    },

    /**
     * Просмотр метки
     */
    async viewPlacemark (id: number, marker: L.Marker): Promise<void> {
      // Отмена редактирования метки перед просмотром другой метки
      if (this.placemark && this.interactionMode === INTERACTION_MODE.EDIT_PLACEMARK) {
        this.undoEditPlacemark()
      }

      // Если уже открыта какая-то метка, то центр и масштаб карты сохранять не нужно
      if (!this.placemark) {
        this.mapPreviousCenter = this.map.getCenter() as L.LatLng

        this.mapPreviousZoom = this.map.getZoom()
      }

      this.$nuxt.$loading.start()

      this.placemark = await request(
        this.$axios,
        'placemark_getPlacemarkById',
        {
          id
        },
        'placemark'
      ) as Placemark

      this.$nuxt.$loading.finish()

      this.placemarkMarker = marker

      this.setViewWithOffset(this.placemark.location as L.LatLng, this.mapPlacemarkZoom)

      this.interactionMode = INTERACTION_MODE.VIEW_PLACEMARK

      this.placemarkBottomSheet = true
    },

    /**
     * Закрытие метки
     */
    closePlacemark (deleteMarkers?: boolean): void {
      if (this.interactionMode === INTERACTION_MODE.EDIT_PLACEMARK) {
        this.undoEditPlacemark()
      }

      if (deleteMarkers === true && this.placemarkMarker) {
        this.mapPlacemarksLayerGroup.removeLayer(this.placemarkMarker)

        delete this.placemarksMarkersReferences[this.placemark.id as number]
      }

      this.placemarkMarker = undefined as unknown as L.Marker

      if (deleteMarkers === true && this.placemarkDraggableMarker) {
        this.mapPlacemarksLayerGroup.removeLayer(this.placemarkDraggableMarker)
      }

      this.placemarkDraggableMarker = undefined as unknown as L.Marker

      this.interactionMode = INTERACTION_MODE.VIEW_MAP

      this.placemarkBottomSheet = false

      this.placemark = undefined as unknown as Placemark

      this.placemarkDeleteConfirmationCount = DELETE_CONFIRMATION_COUNT

      this.map.setView(this.mapPreviousCenter, this.mapPreviousZoom)
    },

    /**
     * Редактирование метки
     */
    editPlacemark (): void {
      this.placemarkBackup = _.cloneDeep(this.placemark) as Placemark

      this.mapPlacemarksLayerGroup.removeLayer(this.placemarkMarker)

      delete this.placemarksMarkersReferences[this.placemark.id as number]

      this.drawDraggablePlacemarkMarker(this.placemark)

      this.$nextTick(() => {
        this.setViewWithOffset(this.placemark.location as L.LatLng, this.mapEditablePlacemarkZoom)
      })

      this.interactionMode = INTERACTION_MODE.EDIT_PLACEMARK
    },

    /**
     * Отмена редактирования метки
     */
    undoEditPlacemark (): void {
      if (this.placemark.id) {
        // Если отменяем создание новой метки, то восстанавливать копию не нужно

        this.placemark = _.cloneDeep(this.placemarkBackup) as Placemark

        this.placemarkBackup = undefined as unknown as Placemark
      }

      this.mapPlacemarksLayerGroup.removeLayer(this.placemarkDraggableMarker)

      if (this.placemark.id) {
        // Если отменяем создание новой метки, то отрисовывать маркер не нужно

        this.placemarkMarker = this.drawPlacemarkMarker(this.placemark)
      }

      this.$nextTick(() => {
        if (this.placemark) {
          // this.placemark может быть undefined если undoEditPlacemark вызывается из closePlacemark (из-за $nextTick)

          this.setViewWithOffset(this.placemark.location as L.LatLng, this.mapPlacemarkZoom)
        }
      })

      this.interactionMode = INTERACTION_MODE.VIEW_PLACEMARK
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

      this.$nuxt.$loading.finish()

      this.placemarkBackup = _.cloneDeep(this.placemark) as Placemark

      this.$nuxt.$emit('snackbar:show', {
        color: 'success',
        text: 'Готово! 🙂'
      } as SnackbarData)
    },

    /**
     * Удаление метки
     */
    async deletePlacemark (): Promise<void> {
      if (this.placemarkDeleteConfirmationCount !== 0) {
        this.placemarkDeleteConfirmationCount -= 1

        this.$nuxt.$emit('snackbar:show', {
          color: 'warning',
          text: 'Нажмите ещё раз ... ☝️'
        } as SnackbarData)

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

      this.$nuxt.$loading.finish()

      this.closePlacemark(true)

      this.$nuxt.$emit('snackbar:show', {
        color: 'success',
        text: 'Готово! 🙂'
      } as SnackbarData)
    },

    /**
     * Фокус на каком-то месте со смещением по высоте / вертикали относительно интерфейса
     */
    setViewWithOffset (latlng: L.LatLng, zoom: number): void {
      const targetViewPoint = this.map
        .project(latlng, zoom)
        .subtract([0, this.$placemarkBottomSheetHeightPixels / 2 * -1])

      const targetViewLatLng = this.map.unproject(targetViewPoint, zoom)

      this.map.setView(targetViewLatLng, zoom)
    },

    /**
     * Получение местоположения пользователя
     */
    getCurrentPosition (): void {
      this.$nuxt.$emit('snackbar:show', {
        color: 'info',
        text: 'Ищем вас ... 🔍'
      } as SnackbarData)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.map.setView(new L.LatLng(position.coords.latitude, position.coords.longitude), this.mapDefaultZoom)

          this.$nuxt.$emit('snackbar:show', {
            color: 'success',
            text: 'Готово! 🙂'
          } as SnackbarData)
        },
        () => {
          this.$nuxt.$emit('snackbar:show', {
            color: 'error',
            text: 'Не получилось ... 😢'
          } as SnackbarData)
        }
      )
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
     * Отрисовка редактируемого маркера метки
     */
    drawDraggablePlacemarkMarker (placemark: Placemark): void {
      this.placemarkDraggableMarker = new L
        .Marker(
          placemark.location as L.LatLng,
          {
            icon: this.getPlacemarkIcon(placemark),
            draggable: true
          }
        )
        .on('move', () => {
          placemark.location = this.placemarkDraggableMarker.getLatLng()
        })

      this.mapPlacemarksLayerGroup.addLayer(this.placemarkDraggableMarker)
    },

    /**
     * Отрисовка маркера метки
     */
    drawPlacemarkMarker (placemark: Placemark): L.Marker {
      const marker = new L
        .Marker(
          placemark.location as L.LatLng,
          {
            icon: this.getPlacemarkIcon(placemark)
          }
        )
        .bindTooltip(placemark.title)
        .on('click', () => {
          this.viewPlacemark(placemark.id as number, marker)
        })

      this.placemarksMarkersReferences[placemark.id as number] = marker.addTo(this.mapPlacemarksLayerGroup)

      return marker
    },

    /**
     * Обработчик изменения типа метки
     */
    onChangePlacemarkTypeHandler (): void {
      this.placemarkDraggableMarker.setIcon(this.getPlacemarkIcon(this.placemark))
    },

    /**
     * Обработка параметров запроса
     */
    processQuery (query: Query): void {
      if (query.placemark_id) {
        this.placemarksMarkersReferences[this.$route.query.placemark_id as number].fire('click')

        return
      }

      if (query.map_center) {
        const mapCenter = query.map_center.split(',')

        if (mapCenter.length === 2) {
          const mapZoom = query.map_zoom || this.mapDefaultZoom

          this.map.setView(
            new L.LatLng(
              mapCenter[0] as unknown as number,
              mapCenter[1] as unknown as number
            ),
            mapZoom
          )
        }
      }
    },

    /**
     * Свайп панели метки
     */
    onPlacemarkBottomSheetTouch (event: TouchEvent): void {
      const offset = this.$placemarkBottomSheetHeightPixels * 0.75

      if (event.touchendY - event.touchstartY > offset) {
        this.closePlacemark()
      }
    }
  },

  head () {
    return {
      title: 'diving.place'
    }
  }
})
</script>

<style lang="css">
@import 'node_modules/leaflet/dist/leaflet.css';
@import 'node_modules/leaflet.markercluster/dist/MarkerCluster.css';
@import 'node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css';

.v-btn
{
  touch-action: manipulation;
}

.v-application--wrap
{
  min-height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100) !important;
}

.z-index--fix
{
  z-index: 1001 !important;
}

.cursor--crosshair
{
  cursor: crosshair !important;
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
