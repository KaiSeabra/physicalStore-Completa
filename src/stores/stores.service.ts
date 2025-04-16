import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async seedStores() {
    const stores = await this.storesRepository.find();
    if (stores.length === 0) {
      const defaultStores = [
        {
          storeName: 'Loja Centro SP',
          takeOutInStore: true,
          shippingTimeInDays: 1,
          latitude: '-23.550520',
          longitude: '-46.633308',
          address1: 'Av. Paulista, 1000',
          address2: 'Loja 1',
          address3: '',
          city: 'São Paulo',
          district: 'Centro',
          state: 'SP',
          type: 'PDV',
          country: 'BR',
          postalCode: '01311000',
          telephoneNumber: '11999999999',
          emailAddress: 'centrosp@loja.com',
        },
        {
          storeName: 'Loja Rio de Janeiro',
          takeOutInStore: true,
          shippingTimeInDays: 2,
          latitude: '-22.906847',
          longitude: '-43.172897',
          address1: 'Av. Atlântica, 2000',
          address2: 'Loja 2',
          address3: '',
          city: 'Rio de Janeiro',
          district: 'Copacabana',
          state: 'RJ',
          type: 'LOJA',
          country: 'BR',
          postalCode: '22021001',
          telephoneNumber: '21988888888',
          emailAddress: 'riodejaneiro@loja.com',
        },
        {
          storeName: 'Loja Belo Horizonte',
          takeOutInStore: true,
          shippingTimeInDays: 3,
          latitude: '-19.919052',
          longitude: '-43.938668',
          address1: 'Av. Amazonas, 3000',
          address2: 'Loja 3',
          address3: '',
          city: 'Belo Horizonte',
          district: 'Centro',
          state: 'MG',
          type: 'LOJA',
          country: 'BR',
          postalCode: '30180000',
          telephoneNumber: '31977777777',
          emailAddress: 'belohorizonte@loja.com',
        },
      ];
      await this.storesRepository.save(defaultStores);
    }
  }

  findAll(): Promise<Store[]> {
    return this.storesRepository.find();
  }

  async findOne(id: number): Promise<Store | null> {
    return this.storesRepository.findOne({ where: { storeID: id } });
  }

  findByState(state: string): Promise<Store[]> {
    return this.storesRepository.find({ where: { state } });
  }
}