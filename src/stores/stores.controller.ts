import {
    Controller,
    Get,
    Param,
    OnModuleInit,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { StoresService } from './stores.service';
  import { CepService } from './api.service';
  import { ShippingService } from './api.service';
  import { Store } from './entities/store.entity';
  
  interface StoreResult {
    name: string;
    city: string;
    postalCode: string;
    type: string;
    distance: string;
    value: Array<{
      prazo: string;
      price?: string;
      description: string;
      codProdutoAgencia?: string;
    }>;
  }
  
  interface Pin {
    position: { lat: number; lng: number };
    title: string;
  }
  
  @Controller('stores')
  export class StoresController implements OnModuleInit {
    constructor(
      private readonly storesService: StoresService,
      private readonly cepService: CepService,
      private readonly shippingService: ShippingService,
    ) {}
  
    async onModuleInit() {
      await this.storesService.seedStores();
    }
  
    @Get()
    async listAll(): Promise<{ stores: Store[]; limit: number; offset: number; total: number }> {
      const stores = await this.storesService.findAll();
      return { stores, limit: 10, offset: 0, total: stores.length };
    }
  
    @Get(':id')
    async storeById(@Param('id') id: string) {
      const store = await this.storesService.findOne(parseInt(id));
      if (!store) {
        throw new NotFoundException('Loja não encontrada');
      }
      return { stores: [store], limit: 1, offset: 0, total: 1 };
    }
  
    @Get('by-state/:state')
    async storeByState(@Param('state') state: string) {
      const stores = await this.storesService.findByState(state);
      return { stores, limit: 10, offset: 0, total: stores.length };
    }
  
    @Get('by-cep/:cep')
    async storeByCep(@Param('cep') cep: string) {
      const cepRegex = /^\d{5}-?\d{3}$/;
      if (!cepRegex.test(cep)) {
        throw new BadRequestException('Formato de CEP inválido');
      }
  
      const address = await this.cepService.getAddress(cep);
      if (!address || address.erro) {
        throw new NotFoundException('CEP não encontrado na base ViaCEP');
      }
  
      const coordinates = await this.cepService.getCoordinates(cep);
      if (!coordinates) {
        throw new NotFoundException('Não foi possível geocodificar o endereço');
      }
  
      const stores = await this.storesService.findAll();
      const results: StoreResult[] = [];
      const pins: Pin[] = [];
  
      for (const store of stores) {
        try {
          const distance = await this.cepService.calculateDistance(
            `${store.latitude},${store.longitude}`,
            `${coordinates.lat},${coordinates.lng}`
          );
  
          if (!distance?.distance?.value) {
            continue;
          }
  
          pins.push({
            position: {
              lat: parseFloat(store.latitude),
              lng: parseFloat(store.longitude)
            },
            title: store.storeName,
          });
  
          const distanceKm = distance.distance.value / 1000;
  
          if (distanceKm <= 50) {
            results.push({
              name: store.storeName,
              city: store.city,
              postalCode: store.postalCode,
              type: 'PDV',
              distance: `${distanceKm.toFixed(1)} km`,
              value: [{
                prazo: `${store.shippingTimeInDays} dia${store.shippingTimeInDays > 1 ? 's' : ''} útil${store.shippingTimeInDays > 1 ? 'eis' : ''}`,
                price: 'R$ 15,00',
                description: 'Motoboy',
              }],
            });
          } else {
            const shippingOptions = await this.shippingService.getShippingOptions(
              store.postalCode,
              cep
            );
  
            const formattedOptions = shippingOptions.map(opt => ({
              prazo: `${opt.delivery_time} dia${opt.delivery_time > 1 ? 's' : ''} útil${opt.delivery_time > 1 ? 'eis' : ''}`,
              codProdutoAgencia: opt.id === 1 ? '04014' : '04510', 
              price: `R$ ${Number(opt.price).toFixed(2)}`,
              description: opt.name,
            }));
  
            results.push({
              name: store.storeName,
              city: store.city,
              postalCode: store.postalCode,
              type: 'LOJA',
              distance: `${distanceKm.toFixed(1)} km`,
              value: formattedOptions.length > 0 ? formattedOptions : [{
                prazo: 'Indisponível',
                description: 'Frete não disponível',
              }],
            });
          }
        } catch (error) {
          console.error(`Erro na loja ${store.storeID}:`, error);
        }
      }
  
      return {
        stores: results,
        pins,
        limit: 10,
        offset: 0,
        total: results.length,
      };
    }
  }