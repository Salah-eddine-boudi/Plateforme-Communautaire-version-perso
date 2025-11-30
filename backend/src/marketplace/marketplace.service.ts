import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';
import { Marketplace } from './entities/marketplace.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(Marketplace)
    private marketplaceRepository: Repository<Marketplace>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async create(createMarketplaceDto: CreateMarketplaceDto) {
    const user = await this.userRepository.findOne({ // Rechercher l'utilisateur par son ID
      where: { id: createMarketplaceDto.user.id },  
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const marketplace = this.marketplaceRepository.create({
      title: createMarketplaceDto.title,
      description: createMarketplaceDto.description,
      price: createMarketplaceDto.price,
      category: createMarketplaceDto.category,
      imageUrl: createMarketplaceDto.imageUrl,
      user: user,
    });

    return this.marketplaceRepository.save(marketplace);
  }

  async findAll() {
    return this.marketplaceRepository.find({
      relations: ['user'], // Inclure les données de l'utilisateur
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} marketplace`;
  }

  async update(id: string, updateMarketplaceDto: UpdateMarketplaceDto) {
    const marketplace = await this.marketplaceRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!marketplace) {
      throw new NotFoundException(`Marketplace with ID ${id} not found`);
    }

    // Mettre à jour les champs fournis dans le DTO
    Object.assign(marketplace, updateMarketplaceDto);

    // Si un nouvel utilisateur est fourni, le récupérer
    if (updateMarketplaceDto.user?.id) {
      const user = await this.userRepository.findOne({
        where: { id: updateMarketplaceDto.user.id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      marketplace.user = user;
    }

    return this.marketplaceRepository.save(marketplace);
  }

  async remove(id: string) {
    const marketplace = await this.marketplaceRepository.findOne({
      where: { id },
    });

    if (!marketplace) {
      throw new NotFoundException(`Marketplace with ID ${id} not found`);
    }

    await this.marketplaceRepository.remove(marketplace);  
    return { message: `Marketplace with ID ${id} has been deleted` };
  }
}
