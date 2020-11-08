import {
  Placemark
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
   * Рисование геометрии
   */
  DRAW = 1,

  /**
   * Добавление / редактирование метки
   */
  EDIT_PLACEMARK = 2
}

/**
 * Режим просмотра
 */
export enum VIEW_MODE {
  PLACEMARK = 0
}

/**
 * Тип метки
 */
export enum PLACEMARK_TYPE {
  MISC = 0,
  DIVE_CLUB = 1,
  DIVE_SITE = 2,
  SHORE = 3,
  SUBMERGED_OBJECT = 4
}

export const PLACEMARK_TYPES = [
  {
    value: PLACEMARK_TYPE.MISC,
    text: 'Разное'
  },
  {
    value: PLACEMARK_TYPE.DIVE_CLUB,
    text: 'Дайвинг-клуб'
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
 * Кол-во подтверждений удаления
 */
export const DELETE_CONFIRMATION_COUNT = 3
