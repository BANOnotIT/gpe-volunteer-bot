import phrases from '../helpers/strings'
import { Composer, Markup, Scenes } from 'telegraf'
import { Event, EventState } from '../models/Event'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'
import { getRepository } from 'typeorm'
import { WHITE_QUESTION_MARK } from '../const/emojies'
import { parseInterval, stringifyInterval } from '../helpers/interval'

const finalStep = new Composer<PEContext>()
  .action('yes', async (ctx) => {
    const eventRepo = getRepository(Event)

    let form = ctx.scene.session.event
    const event = await eventRepo.findOneOrFail(form.eventId)

    if (form.startTime) event.start = form.startTime
    if (form.endTime) event.end = form.endTime
    if (form.description) event.description = form.description
    if (form.status) event.status = form.status

    await eventRepo.save(event)

    await ctx.editMessageText(phrases.eventCreate.final())

    return ctx.scene.enter(SCENE.DEFAULT)
  })
  .action('no', async (ctx) => {
    await ctx.editMessageText(phrases.common.confirm.restart())
    ctx.wizard.selectStep(0)
    return ctx.scene.reenter()
  })

export const EventEditScene = new Scenes.WizardScene<PEContext>(
  SCENE.EDIT_EVENT,

  async (ctx) => {
    const eventRepo = getRepository(Event)
    const events = await eventRepo.createQueryBuilder('event').addOrderBy('event.start', 'ASC').getMany()

    if (events.length === 0) {
      await ctx.reply(phrases.register.choseEventEmpty())
      await ctx.scene.enter(SCENE.ADMIN_MAIN)
      return
    }

    const eventButtons = events.map((event) => [Markup.button.callback(event.represent(), `event#${event.id}`)])
    await ctx.reply(phrases.eventEdit.choseEvent(), Markup.inlineKeyboard(eventButtons))

    ctx.scene.session.event = {}

    return ctx.wizard.next()
  },

  Composer.action<PEContext>(/^event#(\d+)$/, async (ctx) => {
    let eventId = Number(ctx.match[1])
    ctx.scene.session.event.eventId = eventId

    const eventRepo = getRepository(Event)
    const event = await eventRepo.findOne(eventId)

    if (!event) {
      return ctx.wizard.back()
    }

    await ctx.editMessageText(phrases.eventEdit.choseEventChosen({ event: event.represent() }))

    await ctx.reply(phrases.eventEdit.enterDate())
    await ctx.reply(stringifyInterval(event.start, event.end))
    return ctx.wizard.next()
  }),

  Composer.on<PEContext, 'text'>('text', async (ctx) => {
    let text = ctx.message.text
    const eventRepo = getRepository(Event)
    const event = await eventRepo.findOneOrFail(ctx.scene.session.event.eventId)

    if (text !== '+') {
      try {
        const [start, end] = parseInterval(text)
        ctx.scene.session.event.startTime = start
        ctx.scene.session.event.endTime = end
      } catch (e) {
        return ctx.editMessageText(phrases.eventEdit.wrongFormat__html({ error: e.message }), {
          parse_mode: 'HTML',
        })
      }
    }

    await ctx.reply(phrases.eventEdit.enterDescription())
    await ctx.reply(event.description)

    return ctx.wizard.next()
  }),

  Composer.on<PEContext, 'text'>('text', async (ctx) => {
    let text = ctx.message.text
    const eventRepo = getRepository(Event)
    const event = await eventRepo.findOne(ctx.scene.session.event.eventId)

    if (text !== '+') {
      ctx.scene.session.event.description = text
    }

    const btns = {
      [EventState.open]: 'Открыто',
      [EventState.additional]: 'Добор',
      [EventState.closed]: 'Закрыто',
    }

    const eventButtons = Object.entries(btns).map(([state, text]) => [
      Markup.button.callback(event.status === state ? `${WHITE_QUESTION_MARK} ${text}` : text, `state#${state}`),
    ])

    await ctx.reply(phrases.eventEdit.choseEvent(), Markup.inlineKeyboard(eventButtons))

    return ctx.wizard.next()
  }),

  Composer.action<PEContext>(/^state#(\w+)$/, async (ctx) => {
    let status = ctx.match[1] as EventState

    ctx.scene.session.event.status = status

    const btns = {
      [EventState.open]: 'Открыто',
      [EventState.additional]: 'Добор',
      [EventState.closed]: 'Закрыто',
    }
    await ctx.editMessageText(phrases.eventEdit.choseStatusChosen({ status: btns[status] }))

    await ctx.reply(phrases.common.confirm.text(), {
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback(phrases.common.confirm.yes(), 'yes'),
        Markup.button.callback(phrases.common.confirm.no(), 'no'),
      ]).reply_markup,
    })

    return ctx.wizard.next()
  }),
  finalStep,
)
