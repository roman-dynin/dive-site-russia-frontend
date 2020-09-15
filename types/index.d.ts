import L from 'leaflet'

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
  type: number,
  title: string,
  description: string | null,
  location: Location
}

/**
 * Курс
 */
export interface Course {
  id: number | null,
  title: string,
  description: string | null,
  direction: number,
  locations: Location[]
}

export interface TempCourseGeometry {
  markers: L.Marker[]
  polyline: L.Polyline
}
