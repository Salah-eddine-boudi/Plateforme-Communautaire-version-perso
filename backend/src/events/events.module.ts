import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- IMPORT
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity'; // <--- IMPORT

@Module({
  imports: [TypeOrmModule.forFeature([Event])], // <--- IMPORT
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule { }