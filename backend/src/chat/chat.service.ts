import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) { }

  async create(data: { sender: string; text: string }) {
    const message = this.chatRepository.create(data);
    return await this.chatRepository.save(message);
  }

  async findAll() {
    return await this.chatRepository.find({
      order: { createdAt: 'ASC' },
    });
  }
}
