import { Application } from './Application'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { stringifyInterval } from '../helpers/interval'

export enum EventState {
  open = 'open',
  additional = 'additional',
  closed = 'closed',
}

@Entity()
export class Event {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'timestamptz' })
  createdAt: Date

  @Column({ type: 'varchar' })
  status: EventState

  @Column({ type: 'timestamp' })
  start: Date
  @Column({ type: 'timestamp' })
  end: Date

  @Column({ type: 'text' })
  description: string

  @OneToMany(() => Application, (application) => application.event)
  applications: Application[]

  represent() {
    let repr = stringifyInterval(this.start, this.end)

    switch (this.status) {
      case EventState.additional:
        repr += ` (добор)`
        break
      case EventState.closed:
        repr += ` (закрыт)`
    }

    return repr
  }
}
