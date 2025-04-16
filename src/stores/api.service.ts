import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CepService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getAddress(cep: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://viacep.com.br/ws/${cep}/json/`)
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getCoordinates(cep: string) {
    try {
      const address = await this.getAddress(cep);
      if (!address || address.erro) return null;

      const addressParts = [
        address.logradouro,
        address.bairro,
        address.localidade,
        address.uf,
        'Brasil'
      ].filter(Boolean).join(', ');

      const googleApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
      const response = await firstValueFrom(
        this.httpService.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressParts)}&key=${googleApiKey}`
        )
      );

      if (!response.data.results?.length) return null;
      
      return {
        lat: response.data.results[0].geometry.location.lat,
        lng: response.data.results[0].geometry.location.lng
      };
      
    } catch (error) {
      return null;
    }
  }

  async calculateDistance(origin: string, destination: string) {
    try {
      const googleApiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
      const response = await firstValueFrom(
        this.httpService.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destination}&key=${googleApiKey}`
        )
      );
      return response.data.rows[0]?.elements[0];
    } catch (error) {
      return null;
    }
  }
}

@Injectable()
export class ShippingService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getShippingOptions(fromCep: string, toCep: string) {
    try {
      const token = this.configService.get('MELHOR_ENVIO_TOKEN');
      
      // Sanitiza CEPs
      const cleanFromCep = fromCep.replace(/\D/g, '');
      const cleanToCep = toCep.replace(/\D/g, '');

      const response = await firstValueFrom(
        this.httpService.post(
          'https://www.melhorenvio.com.br/api/v2/me/shipment/calculate',
          {
            from: { postal_code: cleanFromCep },
            to: { postal_code: cleanToCep },
            package: {
              height: 10,
              width: 10,
              length: 10,
              weight: 1,
            },
            options: {
              insurance_value: 0,
              receipt: false,
              own_hand: false
            },
            services: '1,2'
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'User-Agent': 'YourApp (contact@example.com)',
              'Content-Type': 'application/json'
            },
          }
        )
      );

      // Filtra e mapeia resposta corretamente
      return response.data
        .filter(service => 
          service.id && 
          [1, 2].includes(service.id) && 
          !service.error
        )
        .map(service => ({
          id: service.id,
          name: service.name,
          price: service.price,
          delivery_time: service.delivery_time,
          company: service.company
        }));

    } catch (error) {
      console.error('Erro Melhor Envio:', error.response?.data || error.message);
      return [];
    }
  }
}