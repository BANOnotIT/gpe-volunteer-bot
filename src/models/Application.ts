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

  @Column({ nullable: true })
  approved: boolean | null

  @ManyToOne(() => Event, (event) => event.applications, { eager: true })
  event: Event

  represent() {
    return `${this.firstname} ${this.midname} ${this.surname} (${this.groupCode})`
  }
}
