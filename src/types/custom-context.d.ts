import { BotConfig } from 'bot-config'
import { Event } from '../models/Event'
import { WizardContext, WizardSessionData } from 'telegraf/typings/scenes'

export interface SceneSession extends WizardSessionData {
  firstname?: string
  midname?: string
  surname?: string
  eventId?: Event['id']
  vaccineMessageId?: number
}

export interface PEContext extends WizardContext<SceneSession> {
  config?: BotConfig
}
