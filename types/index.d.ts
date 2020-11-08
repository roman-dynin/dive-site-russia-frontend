/**
 * Местоположение
 */
export interface Location {
  lat: number | null;
  lng: number | null;
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
 * Сообщение
 */
export interface SnackbarData {
  color: string,
  text: string
}
