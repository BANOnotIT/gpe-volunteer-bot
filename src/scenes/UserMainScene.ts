import { Markup, Scenes } from 'telegraf'
import checkUserIsAdmin from '../middlewares/checkUserIsAdmin'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'
import phrases from '../helpers/strings'

export const UserMainScene = new Scenes.BaseScene<PEContext>(SCENE.DEFAULT)
  .command('admin', checkUserIsAdmin)
  .hears(phrases.user.btns.register(), async (ctx) => ctx.scene.enter(SCENE.REGISTER_ON_EVENT))
  .use(replyWithMainView)

async function replyWithMainView(ctx: PEContext) {
  const keyboard = Markup.keyboard([
    // Markup.button.text(phrases.user.btns.info()),
    Markup.button.text(phrases.user.btns.register())
  ])
  await ctx.reply(phrases.user.greet(), keyboard)
}
