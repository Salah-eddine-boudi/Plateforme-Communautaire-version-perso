import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Marketplace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  // Le prix peut être 0 (pour le "Freemium" ou l'échange de compétences)
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  category: string; // Ex: 'Santé', 'Coaching', 'Matériel'

  @Column({ type: 'text', nullable: true })
  imageUrl?: string; // URL de l'image (lien Google Images ou autre)

  @CreateDateColumn()
  createdAt: Date;

  // --- LA RELATION (Le lien avec l'utilisateur) ---
  // "Plusieurs annonces peuvent appartenir à Un seul utilisateur"
  // (ManyToOne)
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;
}





