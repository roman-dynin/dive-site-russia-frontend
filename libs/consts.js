/**
 * Режим просмотра
 *
 * @type {number}
 */
export const MODE_VIEW = 0

/**
 * Режим "рисования" геометрии для добавления места / объекта / курса
 *
 * @type {number}
 */
export const MODE_DRAW = 1

/**
 * Режим добавления места
 *
 * @type {number}
 */
export const MODE_ADD_DIVE_SITE = 2

/**
 * Режим добавления объекта
 *
 * @type {number}
 */
export const MODE_ADD_OBJECT = 3

/**
 * Режим добавления курса
 *
 * @type {number}
 */
export const MODE_ADD_COURSE = 4

/**
 * Временные данные для работы с местом / объектом
 */
export const TEMP_MARKER_STUB = {
  /**
   * Маркер
   */
  marker: null
}

/**
 * Временные данные для работы с курсом
 */
export const TEMP_POLYLINE_STUB = {
  /**
   * Маркеры (точка A и B)
   */
  markers: [],

  /**
   * Линия
   */
  polyline: null,

  /**
   * Направление (число от 0 до 360)
   */
  direction: 0
}

/**
 * Место
 */
export const DIVE_SITE_STUB = {
  id: null,
  title: null,
  description: null
}

/**
 * Объект
 */
export const OBJECT_STUB = {
  id: null,
  title: null,
  description: null
}

/**
 * Курс
 */
export const COURSE_STUB = {
  id: null,
  title: null,
  description: null,
  direction: 0
}

/**
 * Точка
 */
export const POINT_STUB = {
  id: null,
  target_type: null,
  target_id: null,
  lat: null,
  lng: null
}
