import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    start: Date;

    @Column()
    end: Date;

    @Column()
    type: string;

    @ManyToOne(() => User, (user) => user.id)
    user: User;
}