# 🚀 Guia Completo de Deploy

## Opção 1: Vercel (Recomendado) ⭐

O Vercel é a plataforma criada pela equipe do Next.js e oferece a melhor integração.

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Login no Vercel

```bash
vercel login
```

Isso abrirá seu navegador para fazer login. Use sua conta do GitHub, GitLab ou email.

### Passo 3: Deploy

```bash
cd crypto-analyzer-unified
vercel
```

Na primeira vez, o Vercel vai fazer algumas perguntas:

```
? Set up and deploy "~/crypto-annalyzer/crypto-analyzer-unified"? [Y/n] y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] n
? What's your project's name? crypto-analyzer
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

### Passo 4: Deploy em Produção

Após o primeiro deploy (que vai para preview), faça o deploy em produção:

```bash
vercel --prod
```

### Passo 5: Obter URL

O Vercel vai retornar uma URL como:
```
✅  Production: https://crypto-analyzer.vercel.app
```

---

## Opção 2: Vercel via GitHub (Deploy Automático)

Esta opção cria CI/CD automático - cada push faz deploy automaticamente.

### Passo 1: Acesse o Vercel Dashboard

1. Vá para [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New Project"

### Passo 2: Importar Repositório

1. Selecione o repositório `EduardoManczenko/crypto-annalyzer`
2. Clique em "Import"

### Passo 3: Configurar Projeto

```
Framework Preset: Next.js
Root Directory: crypto-analyzer-unified
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Passo 4: Deploy

Clique em "Deploy" e aguarde ~2-3 minutos.

### Passo 5: Configurar Branch

Em Settings → Git:
- Production Branch: `main` ou `master`
- Deploy Hooks: Ative para deploys automáticos

---

## Opção 3: Netlify

### Passo 1: Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### Passo 2: Login

```bash
netlify login
```

### Passo 3: Build Local

```bash
cd crypto-analyzer-unified
npm run build
```

### Passo 4: Deploy

```bash
netlify deploy --prod --dir=.next
```

**Nota**: Netlify requer configuração adicional para Next.js App Router. Use Vercel para melhor compatibilidade.

---

## Opção 4: Docker (Auto-Hospedagem)

### Passo 1: Criar Dockerfile

```dockerfile
# crypto-analyzer-unified/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

### Passo 2: Build Docker Image

```bash
cd crypto-analyzer-unified
docker build -t crypto-analyzer .
```

### Passo 3: Run Docker Container

```bash
docker run -p 3000:3000 --name crypto-analyzer crypto-analyzer
```

### Passo 4: Acessar

Acesse `http://localhost:3000`

---

## Opção 5: VPS (DigitalOcean, AWS, etc.)

### Passo 1: Conectar ao Servidor

```bash
ssh user@seu-servidor.com
```

### Passo 2: Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Passo 3: Clonar Repositório

```bash
git clone https://github.com/EduardoManczenko/crypto-annalyzer.git
cd crypto-annalyzer/crypto-analyzer-unified
```

### Passo 4: Instalar Dependências e Build

```bash
npm install
npm run build
```

### Passo 5: Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Passo 6: Start com PM2

```bash
pm2 start npm --name "crypto-analyzer" -- start
pm2 save
pm2 startup
```

### Passo 7: Configurar Nginx (Opcional)

```nginx
# /etc/nginx/sites-available/crypto-analyzer
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/crypto-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Testar o Deploy

Após o deploy, teste com:

```bash
# Substituir YOUR_DOMAIN pela URL do deploy
export API_URL="https://YOUR_DOMAIN.vercel.app"

# Testar Bitcoin
curl "$API_URL/api/analyze?q=bitcoin"

# Testar Solana (deve retornar category: "Chain")
curl "$API_URL/api/analyze?q=solana"

# Testar Aave (deve retornar category: "DeFi")
curl "$API_URL/api/analyze?q=aave"

# Testar Ethereum
curl "$API_URL/api/analyze?q=ethereum"
```

### Validações Esperadas:

✅ **Solana**:
- `category: "Chain"` (não "Unknown")
- `logo` preenchido
- `circulating` preenchido
- `priceHistory` com dados

✅ **Aave**:
- `category: "DeFi"`
- `tvl` preenchido
- `chains` com distribuição

✅ **Bitcoin**:
- `category: "Chain"`
- `price` preciso
- `marketCap` preciso
- `tvl` ~$6.28B

---

## Executar Testes Massivos

Após o deploy estar funcionando:

### Método 1: Via npm script (se tiver acesso ao servidor)

```bash
cd crypto-analyzer-unified
npm run test:massive
```

### Método 2: Via Script Bash (testar API direta)

```bash
#!/bin/bash
API_URL="https://YOUR_DOMAIN.vercel.app"

# Lista de testes
declare -a TESTS=(
  "bitcoin"
  "ethereum"
  "solana"
  "avalanche"
  "polygon"
  "arbitrum"
  "optimism"
  "base"
  "aave"
  "uniswap"
  "curve"
  "lido"
  "maker"
  "compound"
)

echo "🧪 Iniciando testes..."
SUCCESS=0
FAIL=0

for TEST in "${TESTS[@]}"; do
  echo -n "Testing $TEST... "

  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/analyze?q=$TEST")

  if [ "$RESPONSE" -eq 200 ]; then
    echo "✅"
    ((SUCCESS++))
  else
    echo "❌ (HTTP $RESPONSE)"
    ((FAIL++))
  fi

  sleep 1
done

echo ""
echo "📊 Resultados:"
echo "   ✅ Sucesso: $SUCCESS"
echo "   ❌ Falhas: $FAIL"
echo "   📈 Taxa: $(( SUCCESS * 100 / (SUCCESS + FAIL) ))%"
```

Salve como `test-api.sh`, dê permissão e execute:

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Troubleshooting

### Erro: "Module not found"

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: Build timeout no Vercel

No Vercel Dashboard:
1. Settings → General
2. Build & Development Settings
3. Aumentar "Function Maximum Duration" para 60s

### Erro: "Too Many Requests" das APIs

**CoinGecko**: Free tier tem limite de 10-50 req/min
**DefiLlama**: Sem limite oficial, mas use delays

Adicione delays nos testes:
```bash
sleep 2  # 2 segundos entre requests
```

### Erro: DNS ainda não funciona

Verifique se realmente está em produção:
```bash
curl -I https://seu-dominio.vercel.app/api/analyze?q=bitcoin
```

Se retornar 502/503, aguarde 1-2 minutos para propagação.

---

## Monitoramento

### Vercel Analytics

Ative automaticamente no dashboard:
- Settings → Analytics → Enable

### Logs em Tempo Real

```bash
# Vercel
vercel logs

# Vercel (production)
vercel logs --prod

# PM2
pm2 logs crypto-analyzer
```

### Health Check

Crie endpoint de health:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}
```

Teste:
```bash
curl https://seu-dominio.vercel.app/api/health
```

---

## Variáveis de Ambiente (Opcional)

Se precisar configurar timeouts ou API keys:

### Vercel Dashboard

1. Settings → Environment Variables
2. Adicionar:

```
API_TIMEOUT=30000
COINGECKO_API_KEY=sua-api-key (se tiver pro)
```

### Ou via CLI

```bash
vercel env add API_TIMEOUT production
# Digite: 30000
```

---

## CI/CD Automático (GitHub Actions)

Para deploys automáticos via GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🎯 Resumo - Opção Mais Rápida

```bash
# 1. Instalar Vercel
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd crypto-analyzer-unified
vercel --prod

# 4. Testar
curl https://SEU_DOMINIO.vercel.app/api/analyze?q=solana

# 5. Executar testes massivos
npm run test:massive
```

**Tempo estimado**: 5-10 minutos do início ao fim! 🚀

---

**Próximo Passo**: Escolha uma das opções acima e faça o deploy. Recomendo **Opção 1 (Vercel CLI)** pela simplicidade.
