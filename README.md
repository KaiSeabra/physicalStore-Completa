# Physical Store API 🏪

API para gestão de lojas físicas e cálculo de opções de entrega usando CEP

## Funcionalidades ✨
- Listagem de lojas cadastradas
- Cálculo de distância usando Google Maps
- Opções de retirada em PDV (até 50km)
- Cálculo de fretes (Sedex/PAC) via Melhor Envio
- Documentação Swagger integrada

## Tecnologias 🛠️
- NestJS
- TypeORM
- SQLite
- Google Maps API
- ViaCEP API
- Melhor Envio API

## Instalação ⚙️

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/physical-store-api.git

2. Installe as Depedencias
npm install

2. Configure o ENV
GOOGLE_MAPS_API_KEY=sua_chave
MELHOR_ENVIO_TOKEN=seu_token

3. Inicia o servidor 
npm run start:dev

## Uso ⚙️

GET /stores                # Lista todas as lojas
GET /stores/{id}           # Busca loja por ID
GET /stores/by-state/{UF}  # Filtra por estado
GET /stores/by-cep/{CEP}   # Calcula opções de entrega