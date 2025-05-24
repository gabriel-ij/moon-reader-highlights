# Moon Reader Highlights

Aplicação para armazenar e visualizar destaques (highlights) do aplicativo Moon Reader.

## Estrutura do Projeto

```
moon-reader-highlights/
├── server/                   # Código backend
│   ├── src/                  # Código fonte principal
│   │   ├── config/           # Configurações da aplicação
│   │   ├── utils/            # Funções utilitárias
│   │   └── index.ts          # Ponto de entrada da aplicação
│   ├── public/               # Arquivos estáticos para o servidor
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

2. Acesse a aplicação em:
   ```
   http://localhost:3000
   ```
   
   A interface web e a API estão disponíveis no mesmo servidor.

## Configuração do Moon Reader

Para enviar destaques do Moon Reader para esta aplicação, siga as instruções no arquivo [READER_SETUP.md](READER_SETUP.md).

## Licença

MIT
