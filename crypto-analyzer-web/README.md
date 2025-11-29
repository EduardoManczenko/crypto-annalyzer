# 🔍 Crypto Analyzer Web

Análise Profissional de Protocolos DeFi e Tokens com Next.js

## 📋 Sobre o Projeto

O Crypto Analyzer Web é uma aplicação moderna desenvolvida com Next.js que permite analisar criptomoedas e protocolos DeFi de forma profissional. O projeto migra todas as funcionalidades do CLI original para uma interface web responsiva e intuitiva.

### ✨ Funcionalidades

- 🔎 **Busca Inteligente**: Pesquise por nome ou símbolo de criptomoedas e protocolos DeFi
- 📊 **Métricas Avançadas**: Market Cap, FDV, Volume, TVL e muito mais
- 📈 **Análise de Performance**: Variações de preço e TVL em múltiplos períodos
- 🧮 **Ratios Profissionais**: FDV/MCap, MCap/TVL, Volume/MCap e % em circulação
- 🚨 **Análise de Risco**: Identificação automática de red flags, warnings e pontos positivos
- ⭐ **Score de Risco**: Classificação de 0 a 100 com recomendações personalizadas
- 🔗 **Distribuição Multi-Chain**: TVL por blockchain para protocolos DeFi
- 📦 **Supply Analysis**: Análise detalhada de circulating, total e max supply

## 🚀 Tecnologias Utilizadas

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização moderna e responsiva
- **Axios** - Requisições HTTP
- **DeFiLlama API** - Dados de protocolos DeFi
- **CoinGecko API** - Dados de criptomoedas

## 📦 Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>

# Navegue até o diretório do projeto
cd crypto-analyzer-web

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

## 🔨 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start

# Lint
npm run lint
```

## 🏗️ Estrutura do Projeto

```
crypto-analyzer-web/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts       # API route para análise
│   ├── globals.css            # Estilos globais
│   ├── layout.tsx             # Layout raiz
│   └── page.tsx               # Página principal
├── components/
│   ├── SearchForm.tsx         # Componente de busca
│   └── Report.tsx             # Componente de relatório
├── types/
│   └── index.ts               # Tipos TypeScript
├── utils/
│   ├── analyzer.ts            # Lógica de análise de risco
│   └── formatters.ts          # Funções de formatação
├── tailwind.config.ts         # Configuração Tailwind
├── tsconfig.json              # Configuração TypeScript
└── package.json               # Dependências
```

## 🎯 Como Usar

1. **Digite o nome da criptomoeda** ou protocolo no campo de busca (ex: Bitcoin, Ethereum, Aave)
2. **Clique em "Analisar"** ou pressione Enter
3. **Visualize o relatório completo** com todas as métricas e análises

## 📊 Fontes de Dados

- **DeFiLlama**: Dados de TVL, protocolos DeFi e distribuição por blockchain
- **CoinGecko**: Dados de preço, market cap, volume e supply

## ⚠️ Aviso Legal

Esta ferramenta é fornecida apenas para fins educacionais e informativos. As análises e recomendações não constituem aconselhamento financeiro. Sempre faça sua própria pesquisa (DYOR) antes de investir.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📝 Licença

ISC

## 🔗 Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DeFiLlama API](https://defillama.com/docs/api)
- [CoinGecko API](https://www.coingecko.com/en/api)

---

Desenvolvido com ❤️ usando Next.js
