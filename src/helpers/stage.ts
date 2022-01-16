import { Telegraf, Scenes } from 'telegraf'
import { SCENE } from '../const/sceneId'
import main from '../scenes/main'
import { PEContext } from '../types/custom-context'
import { RegisterScene } from '../scenes/RegisterScene'
import { UserMainScene } from '../scenes/UserMainScene'
import { EventCreationScene } from '../scenes/EventCreationScene'
import { AdminMainScene } from '../scenes/AdminMainScene'
const debug = require('debug')('bot:stage')

export function setupStage(bot: Telegraf<PEContext>) {
  const stage = new Scenes.Stage<PEContext>([main, RegisterScene, UserMainScene, EventCreationScene, AdminMainScene], {
    default: SCENE.DEFAULT
  })

  bot.use(stage.middleware())
  debug('Stage set')
}
