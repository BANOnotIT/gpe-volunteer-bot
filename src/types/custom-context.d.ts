import { BotConfig } from 'bot-config'
import { Event, EventState } from '../models/Event'
import { WizardContext, WizardSessionData } from 'telegraf/typings/scenes'

type ApplicationSessionData = {
  firstname?: string
  midname?: string
  surname?: string
  eventId?: Event['id']
  groupCode?: string
  vaccineMessageId?: number
}
type EventSessionData = {
  eventId?: number
  status?: EventState
  description?: string
  date?: Date
  startTime?: Date
  endTime?: Date
}

export interface SceneSession extends WizardSessionData {
  application?: ApplicationSessionData
  event?: EventSessionData
}

export interface PEContext extends WizardContext<SceneSession> {
  config?: BotConfig
}
