<template>
  <v-app>
    <!-- Боковая / нижняя панель -->
    <v-navigation-drawer
      v-model="drawer"
      :bottom="$vuetify.breakpoint.smAndDown"
      app
      temporary
      right
      width="500"
      class="pa-3 fix-z-index"
    >
      <h1 class="text-h6 text-center">
        Название места
      </h1>
    </v-navigation-drawer>
    <!-- Диалог добавления места -->
    <v-dialog
      v-model="addDiveSiteDialog"
      max-width="250"
      class="fix-z-index"
    >
      <v-card>
        <v-card-title class="headline pa-3">
          Новое место
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-3">
          Форма
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-3">
          <v-btn @click="closeAddDiveSiteDialog">
            Отмена
          </v-btn>
          <v-btn>
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Диалог добавления объекта -->
    <v-dialog
      v-model="addObjectDialog"
      max-width="250"
      class="fix-z-index"
    >
      <v-card>
        <v-card-title class="headline pa-3">
          Новый объект
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-3">
          Форма
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-3">
          <v-btn @click="closeAddObjectDialog">
            Отмена
          </v-btn>
          <v-btn>
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-main>
      <div class="d-flex flex-column fill-height">
        <!-- Карта -->
        <div
          id="map"
          class="d-flex fill-height"
        />
        <!-- Инструменты -->
        <div class="d-flex pa-3">
          <template v-if="mode === MODE_MAP">
            <v-btn
              class="mr-3"
              @click="setMode(MODE_ADD_DIVE_SITE)"
            >
              Добавить место
            </v-btn>
            <v-btn
              class="mr-3"
              @click="setMode(MODE_ADD_OBJECT)"
            >
              Добавить объект
            </v-btn>
            <v-btn class="mr-3">
              Добавить курс
            </v-btn>
          </template>
          <template v-else>
            <v-btn
              class="mr-3"
              @click="setMode(MODE_MAP)"
            >
              Отмена
            </v-btn>
          </template>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import L from 'leaflet'

import {
  MODE_MAP,
  MODE_ADD_DIVE_SITE,
  MODE_ADD_OBJECT
} from '~/libs/consts'

export default {
  data: () => ({
    MODE_MAP,

    MODE_ADD_DIVE_SITE,

    MODE_ADD_OBJECT,

    drawer: false,

    mode: MODE_MAP,

    addDiveSiteDialog: false,

    addObjectDialog: false,

    map: null,

    mapCenter: [
      53.4367995,
      34.2885255
    ],

    tempMarker: null
  }),

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

    // Тестовый маркер

    L
      .marker(this.mapCenter)
      .bindTooltip('оз. Круглое')
      .on('click', () => {
        this.drawer = true
      })
      .addTo(this.map)

    // Диалог добавления места

    this.map.on('click', (event) => {
      if (this.mode === MODE_MAP) {
        return
      }

      // Временный маркер

      this.tempMarker = L
        .marker(
          event.latlng,
          {
            title: 'Новое место'
          }
        )

      this.tempMarker.addTo(this.map)

      if (this.mode === MODE_ADD_DIVE_SITE) {
        this.addDiveSiteDialog = true
      }

      if (this.mode === MODE_ADD_OBJECT) {
        this.addObjectDialog = true
      }
    })
  },

  methods: {
    /**
     * Изменение "режима" приложения
     *
     * @param {number} mode Константа MODE_*
     */
    setMode (mode) {
      this.mode = mode
    },

    /**
     * Закрытие диалога добавления места
     */
    closeAddDiveSiteDialog () {
      this.mode = MODE_MAP

      this.map.removeLayer(this.tempMarker)

      this.tempMarker = null

      this.addDiveSiteDialog = false
    },

    /**
     * Закрытие диалога добавления объекта
     */
    closeAddObjectDialog () {
      this.mode = MODE_MAP

      this.map.removeLayer(this.tempMarker)

      this.tempMarker = null

      this.addObjectDialog = false
    }
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
