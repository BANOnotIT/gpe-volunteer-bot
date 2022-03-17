import { Markup, Scenes } from 'telegraf'
import checkUserIsAdmin from '../middlewares/checkUserIsAdmin'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'
import phrases from '../helpers/strings'
import { getRepository } from 'typeorm'
import { Application } from '../models/Application'

export const AdminMainScene = new Scenes.BaseScene<PEContext>(SCENE.ADMIN_MAIN)
  .command('add', checkUserIsAdmin, (ctx) => ctx.scene.enter(SCENE.CREATE_EVENT))
  .command('edit', checkUserIsAdmin, (ctx) => ctx.scene.enter(SCENE.EDIT_EVENT))
  .command('list', checkUserIsAdmin, (ctx) => ctx.scene.enter(SCENE.LIST_USERS))
  .action(/^approve#(\d+)$/, async (ctx) => {
    const appRepo = getRepository(Application)
    const application = await appRepo.findOne(ctx.match[1], { loadEagerRelations: true })
    if (!application) {
      // TODO send notice??
      return
    }

    application.approved = true
    await appRepo.save(application)

    const event = await application.event
    await ctx.editMessageText(
      phrases.approve.resolution.approved__html({ user: application.represent(), date: event.represent() }),
    )
    await ctx.telegram.sendMessage(application.tgId, phrases.approve.notice.approved({ date: event.represent() }))
  })
  .action(/^deny#(\d+)$/, async (ctx) => {
    const appRepo = getRepository(Application)
    const application = await appRepo.findOne(ctx.match[1], { loadEagerRelations: true })
    if (!application) {
      // TODO send notice??
      return
    }

    application.approved = false
    await appRepo.save(application)

    const event = await application.event
    await ctx.editMessageText(
      phrases.approve.resolution.denied__html({ user: application.represent(), date: event.represent() }),
    )
    await ctx.telegram.sendMessage(application.tgId, phrases.approve.notice.denied({ date: event.represent() }))
  })
  .hears(phrases.admin.btns.create(), checkUserIsAdmin, (ctx) => ctx.scene.enter(SCENE.CREATE_EVENT))
  .use(replyWithMainView)
  .enter(replyWithMainView)

async function replyWithMainView(ctx: PEContext) {
  const keyboard = Markup.keyboard([
    // Markup.button.text(phrases.user.btns.info()),
    Markup.button.text(phrases.admin.btns.create()),
  ])
    .resize(true)
    .oneTime(true)
  await ctx.reply(phrases.admin.greet(), keyboard)
}
