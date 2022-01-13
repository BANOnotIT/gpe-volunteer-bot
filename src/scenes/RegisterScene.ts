import phrases from '../helpers/strings'
import { Composer, Markup, Scenes } from 'telegraf'
import { Event, EventState } from '../models/Event'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'
import { Application } from '../models/Application'
import { getRepository } from 'typeorm'

const confirmStep = new Composer<PEContext>()
  .action('yes', async (ctx) => ctx.wizard.next())
  .action('no', async (ctx) => {
    await ctx.reply(phrases.register.confirm.restart())
    ctx.wizard.selectStep(0)
    return ctx.scene.reenter()
  })

export const RegisterScene = new Scenes.WizardScene<PEContext>(
  SCENE.REGISTER_ON_EVENT,
  async (ctx) => {
    const eventRepo = getRepository(Event)
    const events = await eventRepo
      .createQueryBuilder('event')
      .where('event.status <> :status', { status: EventState.closed })
      .getMany()

    const eventButtons = events.map((event) => Markup.button.callback(event.represent(), `event#${event.id}`))
    await ctx.reply(phrases.register.choseEvent(), Markup.inlineKeyboard(eventButtons))

    return ctx.wizard.next()
  },
  Composer.action<PEContext>(/^event#(\d+)$/, async (ctx) => {
    let eventId = Number(ctx.match[1])
    ctx.scene.session.eventId = eventId

    const eventRepo = getRepository(Event)
    const event = await eventRepo.findOne(eventId)

    if (!event) {
      return ctx.wizard.back()
    }

    await ctx.editMessageText(phrases.register.choseEventChosen__html({ event: event.represent() }))

    return ctx.wizard.next()
  }),
  async (ctx) => {
    await ctx.reply(phrases.register.enterName())
    return ctx.wizard.next()
  },
  Composer.on<PEContext, 'text'>('text', async (ctx) => {
    ctx.scene.session.firstname = ctx.message.text
    return ctx.wizard.next()
  }),
  async (ctx) => {
    await ctx.reply(phrases.register.enterMidname())
    return ctx.wizard.next()
  },
  Composer.on<PEContext, 'text'>('text', async (ctx) => {
    ctx.scene.session.midname = ctx.message.text
    return ctx.wizard.next()
  }),
  async (ctx) => {
    await ctx.reply(phrases.register.enterSurname())
    return ctx.wizard.next()
  },
  Composer.on<PEContext, 'text'>('text', async (ctx) => {
    ctx.scene.session.surname = ctx.message.text
    return ctx.wizard.next()
  }),

  async (ctx) => {
    await ctx.reply(phrases.register.enterVaccine())
    return ctx.wizard.next()
  },
  async (ctx) => {
    ctx.scene.session.vaccineMessageId = ctx.message.message_id
    return ctx.wizard.next()
  },
  async (ctx) => {
    await ctx.reply(phrases.register.confirm.text())
    return ctx.wizard.next()
  },
  confirmStep,
  async (ctx) => {
    const appRepo = getRepository(Application)
    const eventRepo = getRepository(Event)

    const event = await eventRepo.findOne(ctx.scene.session.eventId!)

    const application = new Application()
    application.firstname = ctx.scene.session.firstname
    application.midname = ctx.scene.session.midname
    application.surname = ctx.scene.session.surname
    application.event = event

    await appRepo.save(application)

    let adminId = ctx.config.telegram.adminChatId
    const msg = await ctx.telegram.forwardMessage(adminId, ctx.chat.id, ctx.scene.session.vaccineMessageId)

    await ctx.telegram.sendMessage(adminId, phrases.approve.approveText__html({ user: application.represent() }), {
      reply_to_message_id: msg.message_id,
      reply_markup: Markup.inlineKeyboard([
        Markup.button.callback(phrases.approve.approveBtn(), `approve#${application.id}`),
        Markup.button.callback(phrases.approve.disapproveBtn(), `deny#${application.id}`)
      ]).reply_markup
    })

    await ctx.reply(phrases.register.final())

    return ctx.scene.enter(SCENE.DEFAULT)
  }
)
