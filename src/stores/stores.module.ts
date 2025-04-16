import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { Store } from './entities/store.entity';
import { HttpModule } from '@nestjs/axios';
import { CepService } from './api.service';
import { ShippingService } from './api.service';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Store]),
    HttpModule,
    ConfigModule.forRoot(), 
  ],
  controllers: [StoresController],
  providers: [StoresService, CepService, ShippingService],
})
export class StoresModule {}