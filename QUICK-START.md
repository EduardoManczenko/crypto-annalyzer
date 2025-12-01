# ⚡ Quick Start - Deploy em 5 Minutos

## 🎯 Caminho Mais Rápido (Vercel)

### 1️⃣ Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2️⃣ Login

```bash
vercel login
```

### 3️⃣ Deploy

```bash
cd crypto-analyzer-unified
vercel --prod
```

### 4️⃣ Copiar URL

O Vercel vai retornar algo como:
```
✅ Production: https://crypto-analyzer-xxx.vercel.app
```

### 5️⃣ Testar

```bash
# Substituir pela sua URL
curl "https://crypto-analyzer-xxx.vercel.app/api/analyze?q=solana"
```

**Pronto!** 🎉

---

## 📱 Alternativa: Deploy via GitHub (Ainda Mais Fácil)

### 1️⃣ Acesse o Vercel

Vá para: https://vercel.com/new

### 2️⃣ Conecte com GitHub

Clique em "Continue with GitHub"

### 3️⃣ Importe o Repositório

1. Selecione `EduardoManczenko/crypto-annalyzer`
2. Root Directory: `crypto-analyzer-unified`
3. Clique em "Deploy"

### 4️⃣ Aguarde 2-3 minutos

O Vercel vai buildar e deployar automaticamente.

### 5️⃣ Acesse a URL

O Vercel vai fornecer uma URL: `https://crypto-analyzer.vercel.app`

**Fim!** Cada push na branch main vai fazer deploy automaticamente! 🚀

---

## 🧪 Testes Rápidos

Após o deploy, teste alguns casos:

```bash
# Definir URL (substituir pela sua)
export API="https://crypto-analyzer-xxx.vercel.app"

# Bitcoin (Chain)
curl "$API/api/analyze?q=bitcoin" | jq '.category'
# Esperado: "Chain"

# Solana (Chain - antes estava "Unknown")
curl "$API/api/analyze?q=solana" | jq '.category'
# Esperado: "Chain"

# Aave (Protocol)
curl "$API/api/analyze?q=aave" | jq '.category'
# Esperado: "DeFi"

# Verificar TVL do Bitcoin
curl "$API/api/analyze?q=bitcoin" | jq '.tvl'
# Esperado: ~6280000000 ($6.28B)

# Verificar se tem logo
curl "$API/api/analyze?q=solana" | jq '.logo'
# Esperado: URL da imagem

# Verificar circulating supply
curl "$API/api/analyze?q=solana" | jq '.circulating'
# Esperado: número > 0

# Verificar gráficos
curl "$API/api/analyze?q=ethereum" | jq '.priceHistory | keys'
# Esperado: ["24h", "7d", "30d", "365d"]
```

---

## 🎨 Acessar Interface

Abra no navegador:
```
https://crypto-analyzer-xxx.vercel.app
```

Interface completa com:
- 🔍 Busca inteligente
- 📊 Gráficos interativos
- 💰 Análise de risco
- 📈 Dados em tempo real

---

## 🐛 Problemas Comuns

### Deploy falhou?

```bash
# Verificar logs
vercel logs --prod
```

### API retornando 404?

Aguarde 1-2 minutos para propagação DNS.

### Ainda não funciona?

```bash
# Redeploy
vercel --prod --force
```

---

## 📊 Próximo Passo: Testes Massivos

Quando quiser testar 100+ blockchains:

```bash
cd crypto-analyzer-unified
npm run test:massive
```

Ou use o script de testes via API (ver DEPLOY-GUIDE.md).

---

## 🎯 Resumo Visual

```
┌─────────────────────┐
│ npm i -g vercel    │  ← 1. Instalar CLI
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ vercel login       │  ← 2. Login
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ cd crypto-analyzer │  ← 3. Entrar no dir
│ vercel --prod      │     e deployar
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 🎉 PRONTO!         │  ← 4. URL gerada
│ crypto-xxx.app     │
└────────────────────┘
```

**Tempo total**: ~5 minutos ⏱️

---

## 💡 Dica Pro

Adicione um domínio customizado no Vercel Dashboard:

1. Settings → Domains
2. Add Domain
3. Digite: `seu-dominio.com`
4. Configure DNS conforme instruções

**Resultado**: `https://seu-dominio.com` 🌐
