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
  VIEW_MAP = 1,

  /**
   * Рисование карты
   */
  DRAW_MAP = 2,

  /**
   * Просмотр метки
   */
  VIEW_PLACEMARK = 3,

  /**
   * Добавление / редактирование метки
   */
  EDIT_PLACEMARK = 4
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

/**
 * Типы меток
 */
export const PLACEMARK_TYPES = [
  {
    value: PLACEMARK_TYPE.MISC,
    text: 'Разное',
    color: 'light-green'
  },
  {
    value: PLACEMARK_TYPE.DIVE_CLUB,
    text: 'Дайвинг-клуб',
    color: 'yellow darken-4'
  },
  {
    value: PLACEMARK_TYPE.DIVE_SITE,
    text: 'Место погружения',
    color: 'light-blue darken-4'
  },
  {
    value: PLACEMARK_TYPE.SHORE,
    text: 'Берег',
    color: 'green darken-4'
  },
  {
    value: PLACEMARK_TYPE.SUBMERGED_OBJECT,
    text: 'Затопленный объект',
    color: 'black'
  }
]

/**
 * Метка
 */
export const PLACEMARK_STUB: Placemark = {
  id: null,
  user_id: null,
  type: PLACEMARK_TYPE.MISC,
  title: '',
  description: null,
  created_at: null
}

/**
 * Кол-во подтверждений для удаления
 */
export const DELETE_CONFIRMATION_COUNT = 3
