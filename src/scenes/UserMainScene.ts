import { Markup, Scenes } from 'telegraf'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'
import phrases from '../helpers/strings'

export const UserMainScene = new Scenes.BaseScene<PEContext>(SCENE.USER_MAIN)
  .hears(phrases.user.btns.register(), async (ctx) => ctx.scene.enter(SCENE.REGISTER_ON_EVENT))
  .hears(phrases.user.btns.info(), async (ctx) => ctx.scene.enter(SCENE.PROFESSIONS))
  .enter(replyWithMainView)
  .use(replyWithMainView)

async function replyWithMainView(ctx: PEContext) {
  const keyboard = Markup.keyboard([
    [Markup.button.text(phrases.user.btns.info()), Markup.button.text(phrases.user.btns.register())],
  ])
    .resize(true)
    .oneTime(true)
  await ctx.reply(phrases.user.greet(), keyboard)
}
