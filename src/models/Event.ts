import { Application } from './Application'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

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

  @Column({ type: 'date' })
  date: Date
  @Column({ type: 'time' })
  start: Date
  @Column({ type: 'time' })
  end: Date

  @Column({ type: 'text' })
  description: string

  @OneToMany(() => Application, (application) => application.event)
  applications: Application[]

  represent() {
    let timeInterval = `${this.start}-${this.end}`
    let date = new Date(this.date).toLocaleDateString()
    let repr = `${timeInterval} ${date}`
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
