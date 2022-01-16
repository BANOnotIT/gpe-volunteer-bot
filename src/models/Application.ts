import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Event } from './Event'

@Entity()
export class Application {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  tgId: number

  @Column()
  createdAt: Date
  @Column()
  firstname: string
  @Column()
  midname: string
  @Column()
  surname: string

  @Column()
  groupCode: string

  @Column({ default: false })
  approved: boolean

  @ManyToOne(() => Event, (event) => event.applications)
  event: Event

  represent() {
    return `${this.firstname} ${this.midname} ${this.surname} (${this.groupCode})`
  }
}
