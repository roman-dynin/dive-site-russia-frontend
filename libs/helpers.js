import _ from 'lodash'

import L from 'leaflet'

export const cloneLayerOptions = (options) => {
  const clone = {}

  _.each(options, (value, key) => {
    if (value.clone) {
      clone[key] = value.clone()
    } else if (value instanceof L.Layer) {
      clone[key] = cloneLayerOptions(value)
    } else {
      clone[key] = value
    }
  })

  return clone
}
