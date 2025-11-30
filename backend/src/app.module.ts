import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // On enlève le ConfigModule pour l'instant pour simplifier au maximum

    // Connexion DIRECTE à la base de données
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      // ⚠️ ATTENTION ICI :
      // Si vous utilisez DOCKER, gardez 'admin'.
      // Si vous avez installé PostgreSQL WINDOWS, mettez 'postgres'.
      username: 'admin',
      password: 'password123',
      database: 'projet15_community', // Si cette base n'existe pas, mettez 'postgres'
      autoLoadEntities: true, // Pour que les entités soient chargées automatiquement
      synchronize: true, // Pour que les entités soient synchronisées avec la base de données
    }),

    UsersModule,

    MarketplaceModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
