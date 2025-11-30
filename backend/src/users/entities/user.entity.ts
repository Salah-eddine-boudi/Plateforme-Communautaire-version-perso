import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert, // Avant d'insérer
  BeforeUpdate, // Avant de mettre à jour
} from 'typeorm';
import * as bcrypt from 'bcrypt';

// Les 3 rôles clés pour votre projet (Admin, Adhérent, Invité)
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') // ID unique sécurisé
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  // Indispensable pour l'espace privé [cite: 15]
  @Column({
    type: 'enum', // Utilisez 'simple-enum' si postgres râle, mais 'enum' est standard
    enum: UserRole,
    default: UserRole.GUEST,
  })
  role: UserRole;

  @Column({ type: 'text', nullable: true }) // Pour la présentation de la communauté [cite: 11]
  bio: string;

  // Crucial pour le filtre "ChatGPT" et l'échange de ressources [cite: 7, 10]
  @Column('simple-array', { nullable: true })
  skills: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert() //
  @BeforeUpdate() // Avant d'insérer ou mettre à jour
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}

