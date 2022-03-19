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
      register: 'Хочу зарегистрироваться',
    },
  },
  admin: {
    greet:
      'Команды которые я умею обрабатывать:' +
      '\n/add ― для добавления мероприятия на регистрацию' +
      '\n/edit ― для изменения мероприятий' +
      '\n/list ― для получения списка подтверждённых участников',
    btns: {
      info: '❓ Что надо будет делать?',
      create: '➕ Создать мероприятие',
    },
  },
  system: {
    accessDenied: 'Я не знаю такую команду...',
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
      uploadedFiles: 'Загруженные документы',
    },
  },
  approve: {
    approveText__html: 'Принимаем <b>{user}</b>?',
    resolution: {
      approved__html: `{user} ${GREEN_MARK} {date}`,
      denied__html: `{user} ${RED_CROSS}`,
    },
    approveBtn: `Да ${GREEN_MARK}`,
    denyBtn: `Нет ${RED_CROSS}`,
    notice: {
      approved: `Заявка на {date} была принята! ${GREEN_MARK}`,
      denied: `Заявка на {date} была отклонена ${RED_CROSS}`,
    },
  },
  common: {
    confirm: {
      text: 'Данные верны?',
      yes: 'Да, данные верны',
      no: 'Нет, давай по-новой',
      restart: 'По-новой так по-новой...',
    },
    backBtn: '🔙 Назад',
  },
  register: {
    choseEvent: 'Выбери на какое записываешься?',
    choseEventEmpty: 'К сожалению, сейчас нет мероприятий для записи',
    choseEventChosen: 'Выбери на какое записываешься?\n{event}\n\n{description}',
    enterName: 'Введи своё имя',
    enterMidname: 'Введи своё отчество',
    enterSurname: 'Введи свою фамилию',
    // TODO надо более правильную формулировку
    enterGroup__html: 'Укажи индекс своей группы (пример: <code>ИУ7-11Б</code>)',
    enterVaccine: 'Приложи сертификат о вакцинации',
    final: 'Заявка принята на рассмотрение. Я напишу, если она будет принята или если будут проблемы.',
  },
  eventCreate: {
    enterDate: 'Введите дату (дд.мм.гг)',
    enterTimeSpan__html: 'Введите промежуток времени в формате <code>{format}</code>',
    wrongFormat__html: 'Не могу понять, что это. Попробуйте ещё раз с соблюдением формата <code>{format}</code>',
    enterDescription: 'Введите описание. Оно будет показываться пользователям при регистрации',
    final: 'Мероприятие сохранено и на него теперь можно регистрироваться.',
  },
  eventEdit: {
    choseEvent: 'Редактируем мероприятие?',
    choseEventChosen: 'Редактируем мероприятие\n{event}',
    enterDate: 'Введите дату и время. Введите, + чтобы оставить текущее. Текущее значение:',
    wrongFormat__html: 'Не могу понять, что это. Попробуйте ещё раз с соблюдением формата <code>{format}</code>',
    enterDescription: 'Введите описание. Введите, + чтобы оставить текущее. Текущее значениеЖ',
    choseStatus: 'Выберите открытость',
    choseStatusChosen: 'Выбранное состояние:\n{status}',
    final: 'Мероприятие сохранено.',
  },
  professions: {
    generalInfo: `Всего есть 3 роли: катальщики, протиральщики и реклама. О какой хочешь узнать?`,

    ballHandler: {
      categoryBtn: 'Катальщики 🏐',
      rules__html: `
<b>Катальщики</b> занимаются мячами.
Задача катальщиков: подавать новый мяч на каждый розыгрыш, если предыдущий вышел за поле. Надо чтобы мяч в новом розыгрыше мяч был сухой. Когда подающий катальщик подал мяч, надо перекатить мяч ему.

Правила:
- если игрок взял мяч прошлого розыгрыша и пошёл с ним на подачу, не надо ему подавать новый
- мячи между катальщиками передаются по полу без прыжков только между розыгрышами ― чтобы не отвлекать зрителей
- после свистка на подачу катать нельзя ― чтобы не отвлекать подающего
- об пол мяч не бить, держать спокойной в руках ― чтобы не отвлекать вообще никого
- во время перерыва мячи игрокам не давать ― спортсмены отдыхают
- если будет 5 партия, то перед ней надо один мяч принести к ставленнику секретаря ― так положено
        `,

      examplesBtn: 'Посмотреть видео 📽',

      video: {
        giveOut: 'Катальщик передаёт мяч игроку на подачу',
        pass: 'Передача мяча за щитом подающему катальщику',
      },
    },

    cleaner: {
      categoryBtn: 'Протиральщики ☔',
      rules__html: `
<b>Протиральщики</b> занимаются протиранием поля.
Задача протиральщиков: следить чтобы на поле не было луж или следов от пота. Надо чтобы никто на луже не подскользнулся.

Как это работает:
Во время игры следите за игроками, если кто-то упал на колено, локоть или ещё чем-то, то надо обратить внимание на это место. Как только закончился розыгрыш игроки тоже смотрят вокруг себя, если кто-то поднял руку, значит надо подбежать одному протиральщику к нему и протереть. Как только протёрли минимальным путём уходите с поля и возвращаетесь на своё место шагом не по полю.

Во время перерывов и между партиями игроки пьют воду. Как только они разошлись от места и пошли на расстановку надо место водопоя протереть, чтобы луж не было.    
      `,
      examplesBtn: 'Посмотреть видео 📽',
      video: {
        simple: 'Игрок поднял руку, протиральщик подбежал, протёр и убежал.',
      },
    },
  },
  errors: {
    notText: 'К сожалению, я не понимаю. Введите значение текстом',
  },
}

export default instrumentWithVars(strings)
