import { Scenes } from 'telegraf'
import { SCENE } from '../const/sceneId'
import { PEContext } from '../types/custom-context'

const scene = new Scenes.BaseScene<PEContext>(SCENE.DEFAULT)
scene.command('info', (ctx) => ctx.reply(`chat id: ${ctx.chat.id}`)).use(replyWithMainView)

async function replyWithMainView(ctx: PEContext) {
  if (String(ctx.chat.id) !== String(ctx.config.telegram.adminChatId)) {
    return ctx.scene.enter(SCENE.USER_MAIN)
  } else {
    return ctx.scene.enter(SCENE.ADMIN_MAIN)
  }
}

export default scene
