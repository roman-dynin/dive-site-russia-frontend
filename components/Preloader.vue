<template>
  <div
    v-show="show"
    class="spinner-wrapper"
  >
    <div class="spinner" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data () {
    return {
      show: false as boolean
    }
  },

  created () {
    this.$root.$on('preloader:show', () => {
      this.show = true
    })

    this.$root.$on('preloader:hide', () => {
      this.show = false
    })
  },

  beforeDestroy () {
    this.$root.$off('preloader:show')

    this.$root.$off('preloader:hide')
  },

  methods: {

    start (): void {
      this.show = true
    },

    finish (): void {
      this.show = false
    }
  }
})
</script>

<style>
.spinner-wrapper
{
  position: fixed;
  z-index: 999999;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background: rgba(255, 255, 255, .5);
}

.spinner
{
  position: absolute;
  top: 50%;
  left: 50%;

  width: 80px;
  height: 80px;
  margin: -40px 0 0 -40px;

  -webkit-animation: sk-scale-out 1.0s infinite ease-in-out;
  animation: sk-scale-out 1.0s infinite ease-in-out;

  border-radius: 100%;
  background-color: #69c;
}

@-webkit-keyframes sk-scale-out
{
  0%
  {
    -webkit-transform: scale(0);
  }
  100%
  {
    -webkit-transform: scale(1.0);

    opacity: 0;
  }
}

@keyframes sk-scale-out
{
  0%
  {
    -webkit-transform: scale(0);
    transform: scale(0);
  }
  100%
  {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);

    opacity: 0;
  }
}
</style>
