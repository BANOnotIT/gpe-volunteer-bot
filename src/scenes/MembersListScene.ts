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
    const events = await eventRepo.createQueryBuilder('event').addOrderBy('event.date', 'ASC').getMany()

    const eventButtons = events.map((event) => [Markup.button.callback(event.represent(), `event#${event.id}`)])
    await ctx.reply(phrases.eventEdit.choseEvent(), Markup.inlineKeyboard(eventButtons))

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

    const users = applications.map((app) => app.represent())
    await ctx.reply(users.join(', '))
    await ctx.reply(users.join('\n'))

    return ctx.scene.enter(SCENE.DEFAULT)
  }),
)