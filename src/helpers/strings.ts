import lodash from 'lodash'
import format from 'string-template'
import { GREEN_MARK, RED_CROSS, WHITE_QUESTION_MARK } from '../const/emojies'

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
    approveBtn: 'Да',
    disapproveBtn: 'Нет'
  },
  register: {
    choseEvent: 'Выбери на какое записываешься?',
    choseEventChosen__html: 'Выбери на какое записываешься?\n<b>{event}</b>',
    enterName: 'Введи своё имя',
    enterMidname: 'Введи своё отчество',
    enterSurname: 'Введи свою фамилию',
    // TODO надо более правильную формулировку
    enterVaccine: 'Приложи сертификат о вакцинации',
    confirm: {
      text: 'Данные верны?',
      yes: 'Да, данные верны',
      no: 'Нет, давай по-новой',
      restart: 'По-новой так по-новой...'
    },
    final: 'Заявка принята на рассмотрение. Я напишу, если она будет принята или если будут проблемы.'
  },
  errors: {
    notText: 'К сожалению, я не понимаю. Введите значение текстом'
  }
}

export default instrumentWithVars(strings)
