import {
  Placemark,
  Course
} from '~/types'

/**
 * Режим взаимодействия
 */
export enum INTERACTION_MODE {
  /**
   * Просмотр карты
   */
  VIEW = 0,

  /**
   * “Рисование” геометрии
   */
  DRAW = 1,

  /**
   * Добавление / редактирование метки
   */
  MANAGE_PLACEMARK = 2,

  /**
   * Добавление / редактирование курса
   */
  MANAGE_COURSE = 3
}

/**
 * Режим просмотра
 */
export enum VIEW_MODE {
  PLACEMARK = 0,
  COURSE = 1
}

/**
 * Метка: тип
 */
export enum PLACEMARK_TYPE {
  MISC = 0,
  DIVE_SITE = 1,
  SHORE = 2,
  SUBMERGED_OBJECT = 3
}

export const PLACEMARK_TYPES = [
  {
    value: PLACEMARK_TYPE.MISC,
    text: 'Разное'
  },
  {
    value: PLACEMARK_TYPE.DIVE_SITE,
    text: 'Место погружения'
  },
  {
    value: PLACEMARK_TYPE.SHORE,
    text: 'Берег'
  },
  {
    value: PLACEMARK_TYPE.SUBMERGED_OBJECT,
    text: 'Затопленный объект'
  }
]

/**
 * Метка
 */
export const PLACEMARK_STUB: Placemark = {
  id: null,
  type: PLACEMARK_TYPE.MISC,
  title: '',
  description: null,
  location: {
    lat: null,
    lng: null
  }
}

/**
 * Курс
 */
export const COURSE_STUB: Course = {
  id: null,
  title: '',
  description: null,
  direction: 0,
  locations: []
}
