import phrases from '../helpers/strings'
import { Composer, Markup, Scenes } from 'telegraf'
import { Event, EventState } from '../models/Event'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'
import { getRepository } from 'typeorm'
import { humanFormat, parseInterval } from '../helpers/interval'

const finalStep = new Composer<PEContext>()
  .action('yes', async (ctx) => {
    const eventRepo = getRepository(Event)

    const event = new Event()
    event.createdAt = new Date()
    event.start = ctx.scene.session.event.startTime
    event.end = ctx.scene.session.event.endTime
    event.description = ctx.scene.session.event.description
    event.status = EventState.open

    await eventRepo.save(event)

    await ctx.editMessageText(phrases.eventCreate.final())

    return ctx.scene.enter(SCENE.DEFAULT)
  })
  .action('no', async (ctx) => {
    await ctx.editMessageText(phrases.common.confirm.restart())
    ctx.wizard.selectStep(0)
    return ctx.scene.reenter()
  })

export const EventCreationScene = new Scenes.WizardScene<PEContext>(
  SCENE.CREATE_EVENT,

  async (ctx) => {
    ctx.scene.session.event = {}

    await ctx.reply(phrases.eventCreate.enterTimeSpan__html({ format: humanFormat }), {
      parse_mode: 'HTML',
      reply_markup: Markup.removeKeyboard().reply_markup,
    })
    return ctx.wizard.next()
  },

  Composer.on<PEContext, 'text'>('text', async (ctx) => {
    let text = ctx.message.text

    try {
      const [start, end] = parseInterval(text)
      ctx.scene.session.event.startTime = start
      ctx.scene.session.event.endTime = end
    } catch (e) {
      return ctx.editMessageText(phrases.eventCreate.wrongFormat__html({ error: e.message }), {
        parse_mode: 'HTML',
      })
    }

    await ctx.reply(phrases.eventCreate.enterDescription())

    return ctx.wizard.next()
  }),

  Composer.on<PEContext, 'text'>('text', async (ctx) => {
    ctx.scene.session.event.description = ctx.message.text

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
