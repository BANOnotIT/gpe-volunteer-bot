import phrases from '../helpers/strings'
import { Composer, Markup, Scenes } from 'telegraf'
import { Event } from '../models/Event'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'
import { getRepository } from 'typeorm'
import { Application } from '../models/Application'

export const MembersListScene = new Scenes.WizardScene<PEContext>(
  SCENE.LIST_USERS,

  async (ctx) => {
    const eventRepo = getRepository(Event)
    const events = await eventRepo.createQueryBuilder('event').addOrderBy('event.start', 'ASC').getMany()

    if (events.length === 0) {
      await ctx.reply(phrases.register.choseEventEmpty())
      await ctx.scene.enter(SCENE.ADMIN_MAIN)
      return
    }

    const eventButtons = events.map((event) => [Markup.button.callback(event.represent(), `event#${event.id}`)])
    await ctx.reply('Список участников какого мероприятия выдать?', Markup.inlineKeyboard(eventButtons))

    ctx.scene.session.event = {}

    return ctx.wizard.next()
  },

  Composer.action<PEContext>(/^event#(\d+)$/, async (ctx) => {
    let eventId = Number(ctx.match[1])

    const applicationsRepo = getRepository(Application)
    const applications = await applicationsRepo
      .createQueryBuilder('app')
      .innerJoin('app.event', 'event')
      .where('event.id = :eventId', { eventId })
      .andWhere('app.approved = true')
      .addOrderBy('app.groupCode', 'ASC')
      .addOrderBy('app.surname', 'ASC')
      .addOrderBy('app.firstname', 'ASC')
      .addOrderBy('app.midname', 'ASC')
      .getMany()

    if (applications.length === 0) {
      await ctx.reply('Нет подтверждённых участников')
      return ctx.scene.enter(SCENE.DEFAULT)
    }

    const users = applications.map((app) => app.represent())
    await ctx.reply(users.join(', '))
    await ctx.reply(users.join('\n'))

    return ctx.scene.enter(SCENE.DEFAULT)
  }),
)
