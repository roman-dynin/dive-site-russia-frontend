<template>
  <v-snackbar
    v-model="snackbarShow"
    app
    :timeout="5000"
    :top="true"
    :color="snackbarData.color"
    class="z-index--fix"
  >
    {{ snackbarData.text }}
    <template v-slot:action="{ attrs }">
      <v-btn
        v-bind="attrs"
        text
        @click="snackbarShow = false"
      >
        Закрыть
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from 'vue'

import {
  SnackbarData
} from '~/types'

export default Vue.extend({
  data () {
    return {
      snackbarShow: false as boolean,

      snackbarData: {
        color: 'primary',
        text: ''
      } as SnackbarData
    }
  },

  created () {
    this.$root.$on('snackbar:show', (snackbarData: SnackbarData) => {
      this.snackbarData = snackbarData

      this.snackbarShow = true
    })
  },

  beforeDestroy () {
    this.$root.$off('snackbar:show')
  }
})
</script>
