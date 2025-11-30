import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt'; // <--- Outil de sécurité

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  // 1. CRÉATION SÉCURISÉE
  async create(createUserDto: CreateUserDto) {
    // On génère un "sel" (code aléatoire)
    const salt = await bcrypt.genSalt();
    // On mélange le mot de passe avec le sel
    const hash = await bcrypt.hash(createUserDto.password, salt);

    // On enregistre l'utilisateur avec le mot de passe CHIFFRÉ
    const user = this.userRepository.create({
      ...createUserDto,
      password: hash,
    });
    return this.userRepository.save(user);
  }

  // 2. RECHERCHE PAR EMAIL (Pour le Login)
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // ... Le reste (findAll, findOne...) ne change pas ...
  findAll() {
    return this.userRepository.find();
  }

  findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update(id, updateUserDto);
  }

  remove(id: string) {
    return this.userRepository.delete(id);
  }
}
