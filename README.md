# Moon Reader Highlights

Aplicação para armazenar e visualizar destaques (highlights) do aplicativo Moon Reader.

## Estrutura do Projeto

```
moon-reader-highlights/
├── server/                   # Código backend
│   ├── src/                  # Código fonte principal
│   │   ├── config/           # Configurações da aplicação
│   │   ├── controllers/      # Controladores de rotas
│   │   ├── models/           # Definições de tipos e modelos
│   │   ├── routes/           # Definições de rotas
│   │   ├── services/         # Lógica de negócios
│   │   ├── utils/            # Funções utilitárias
│   │   └── index.ts          # Ponto de entrada da aplicação
│   ├── public/               # Arquivos estáticos para o servidor
│   ├── tests/                # Testes automatizados
│   ├── database/             # Scripts de migração e seeds
│   └── logs/                 # Arquivos de log
├── package.json
├── tsconfig.json
└── README.md
```

## Requisitos

- Node.js (v14+)
- npm ou yarn

## Instalação

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/moon-reader-highlights.git
   cd moon-reader-highlights
   ```

2. Instale as dependências:
   ```
   npm install
   ```
   ou
   ```
   yarn
   ```

## Executando o Projeto

1. Inicie o servidor em modo de desenvolvimento:
   ```
   npm run dev
   ```
   ou
   ```
   yarn dev
   ```

2. Acesse a interface web em:
   ```
   http://localhost:3001
   ```

3. A API estará disponível em:
   ```
   http://localhost:3000
   ```

## Configuração do Moon Reader

Para enviar destaques do Moon Reader para esta aplicação, siga as instruções no arquivo [READER_SETUP.md](READER_SETUP.md).

## Licença

MIT
