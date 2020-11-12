import L from 'leaflet'

/**
 * Пользователь
 */
export interface User {
  nickname: string
}

/**
 * Местоположение
 */
export interface Location {
  lat: number | null,
  lng: number | null
}

/**
 * Метка
 */
export interface Placemark {
  id: number | null,
  user_id: number | null, // eslint-disable-line camelcase
  type: number,
  title: string,
  description: string | null,
  created_at: string | null, // eslint-disable-line camelcase
  user?: User,
  location?: Location
}

/**
 * Ссылки на маркеры меток
 */
export interface PlacemarksMarkersReferencesMap {
  [key: number]: L.Marker
}

/**
 * Параметры запроса
 */
export interface Query {
  placemark_id?: number // eslint-disable-line camelcase,
  map_center?: string, // eslint-disable-line camelcase
  map_zoom?: number // eslint-disable-line camelcase
}

/**
 * Сообщение
 */
export interface SnackbarData {
  color: string,
  text: string
}

/**
 * Событие касания
 */
export interface TouchEvent {
  touchstartY: number,
  touchendY: number
}
