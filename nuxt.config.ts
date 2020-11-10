import type { NuxtConfig } from '@nuxt/types'

import dotenv from 'dotenv'

dotenv.config()

const config: NuxtConfig = {
  ssr: false,

  head: {
    meta: [
      {
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, minimal-ui'
      }
    ]
  },

  loading: '@/components/Preloader.vue',

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify'
  ],

  axios: {
    baseURL: process.env.API_BASE_URL
  },

  auth: {
    strategies: {
      local: {
        user: {
          property: 'user',
          autoFetch: true
        },
        endpoints: {
          user: {
            url: '/api/v1/user',
            method: 'get'
          },
          logout: false
        }
      }
    }
  }
}

export default config
