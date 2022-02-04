import lodash from 'lodash'
import format from 'string-template'
import { GREEN_MARK, RED_CROSS } from '../const/emojies'

type TemplateProcessor = (values?: { [key: string]: string }) => string
type InstrumentedStringTree<T> = {
  [P in keyof T]: T[P] extends string ? TemplateProcessor : InstrumentedStringTree<T[P]>
}

type StringTree = {
  [key: string]: string | StringTree
}

function instrumentWithVars<T extends StringTree>(src: T) {
  let result = {}

  for (let key of Object.keys(src)) {
    const source = src[key]

    if (typeof source === 'string') {
      result[key] = (data?: { [key: string]: string }) => {
        if (key.endsWith('__html')) {
          data = lodash.mapValues(data, (val) => lodash.escape(val))
        }

        return format(source || key, data)
      }
    } else {
      result[key] = instrumentWithVars(source)
    }
  }

  return result as InstrumentedStringTree<T>
}

const strings = {
  user: {
    greet: 'Привет! Я бот для регистрации на Чемпионат России по волейболу.',
    btns: {
      info: 'Что надо будет делать?',
      register: 'Хочу зарегистрироваться'
    }
  },
  admin: {
    greet: 'Команды которые я умею обрабатывать:' + '\n/add ― для добавления мероприятия на регистрацию',
    // '\n/edit ― для изменения мероприятий',
    btns: {
      info: 'Что надо будет делать?',
      create: 'Создать мероприятие'
    }
  },
  system: {
    accessDenied: 'Я не знаю такую команду...'
  },
  main: {
    admin: `Можно создавать команды.
        
/cancel - всегда вернёт в главное меню`,
    user: `Твоя команда - {team}
Ты можешь загрузить новые документы, или перезагрузить старые.

/cancel - всегда вернёт в главное меню`,
    btns: {
      addTeam: 'Создать команду',
      gdriveHealthcheck: 'Состояние GDrive',
      uploadDocuments: 'Загрузить документ',
      uploadedFiles: 'Загруженные документы'
    }
  },
  approve: {
    approveText__html: 'Принимаем <b>{user}</b>?',
    resolution: {
      approved__html: `{user} ${GREEN_MARK} {date}`,
      denied__html: `{user} ${RED_CROSS}`
    },
    approveBtn: `Да ${GREEN_MARK}`,
    denyBtn: `Нет ${RED_CROSS}`,
    notice: {
      approved: `Заявка на {date} была принята! ${GREEN_MARK}`,
      denied: `Заявка на {date} была отклонена ${RED_CROSS}`
    }
  },
  common: {
    confirm: {
      text: 'Данные верны?',
      yes: 'Да, данные верны',
      no: 'Нет, давай по-новой',
      restart: 'По-новой так по-новой...'
    }
  },
  register: {
    choseEvent: 'Выбери на какое записываешься?',
    choseEventChosen: 'Выбери на какое записываешься?\n{event}\n\n{description}',
    enterName: 'Введи своё имя',
    enterMidname: 'Введи своё отчество',
    enterSurname: 'Введи свою фамилию',
    // TODO надо более правильную формулировку
    enterGroup__html: 'Укажи индекс своей группы (пример: <code>ИУ7-11Б</code>)',
    enterVaccine: 'Приложи сертификат о вакцинации',
    final: 'Заявка принята на рассмотрение. Я напишу, если она будет принята или если будут проблемы.'
  },
  eventCreate: {
    enterDate: 'Введите дату',
    enterTimeSpan__html: 'Введите промежуток времени в формате <code>{format}</code>',
    wrongFormat__html: 'Не могу понять, что это. Попробуйте ещё раз с соблюдением формата <code>{format}</code>',
    enterDescription: 'Введите описание. Оно будет показываться пользователям при регистрации',
    final: 'Мероприятие сохранено и на него теперь можно регистрироваться.'
  },
  errors: {
    notText: 'К сожалению, я не понимаю. Введите значение текстом'
  }
}

export default instrumentWithVars(strings)
