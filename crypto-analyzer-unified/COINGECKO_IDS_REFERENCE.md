# CoinGecko IDs Reference - Chains Principais

## Referência de IDs Corretos do CoinGecko

Este documento lista os IDs corretos do CoinGecko para as principais blockchains.
Use esta referência para atualizar `lib/data-sources/chain-mappings.ts`.

---

## ✅ IDs VERIFICADOS E CORRETOS

### Layer 1 Blockchains

| Chain | Symbol | CoinGecko ID | Status |
|-------|--------|--------------|--------|
| **Ethereum** | ETH | `ethereum` | ✅ Correto |
| **Bitcoin** | BTC | `bitcoin` | ✅ Correto |
| **Solana** | SOL | `solana` | ✅ Correto |
| **Binance Smart Chain** | BNB | `binancecoin` | ✅ Correto |
| **Polygon** | MATIC/POL | `matic-network` | ✅ CORRIGIDO (era polygon-ecosystem-token) |
| **Avalanche** | AVAX | `avalanche-2` | ✅ Correto |
| **Cardano** | ADA | `cardano` | ✅ Correto |
| **Polkadot** | DOT | `polkadot` | ✅ Correto |
| **Tron** | TRX | `tron` | ✅ Correto |
| **Cosmos** | ATOM | `cosmos` | ✅ Correto |
| **Sui** | SUI | `sui` | ✅ Correto |
| **Aptos** | APT | `aptos` | ✅ Correto |
| **Near** | NEAR | `near` | ✅ Correto |
| **Algorand** | ALGO | `algorand` | ✅ Correto |
| **Stellar** | XLM | `stellar` | ✅ Correto |
| **Ripple** | XRP | `ripple` | ✅ Correto |
| **Fantom** | FTM | `fantom` | ✅ Correto |
| **Cronos** | CRO | `crypto-com-chain` | ⚠️ Verificar |
| **Hedera** | HBAR | `hedera-hashgraph` | ✅ Correto |
| **VeChain** | VET | `vechain` | ✅ Correto |
| **Tezos** | XTZ | `tezos` | ✅ Correto |
| **Elrond/MultiversX** | EGLD | `elrond-erd-2` | ✅ Correto |
| **Theta** | THETA | `theta-token` | ✅ Correto |
| **Filecoin** | FIL | `filecoin` | ✅ Correto |
| **Internet Computer** | ICP | `internet-computer` | ✅ Correto |
| **EOS** | EOS | `eos` | ✅ Correto |
| **Harmony** | ONE | `harmony` | ✅ Correto |
| **Flow** | FLOW | `flow` | ✅ Correto |
| **Mina** | MINA | `mina-protocol` | ✅ Correto |
| **Kava** | KAVA | `kava` | ✅ Correto |
| **Berachain** | BERA | `berachain-bera` | ⚠️ Verificar (pode ser novo) |
| **Celestia** | TIA | `celestia` | ✅ Correto |
| **Sei** | SEI | `sei-network` | ✅ Correto |
| **Injective** | INJ | `injective-protocol` | ✅ Correto |
| **Osmosis** | OSMO | `osmosis` | ✅ Correto |

### Layer 2 Blockchains

| Chain | Symbol | CoinGecko ID | Status |
|-------|--------|--------------|--------|
| **Arbitrum** | ARB | `arbitrum` | ✅ Correto |
| **Optimism** | OP | `optimism` | ✅ Correto |
| **Base** | BASE | `base` | ⚠️ Verificar (pode não ter token) |
| **Polygon zkEVM** | POL | `polygon-zkevm` | ⚠️ Verificar |
| **zkSync Era** | ZK | `zksync` | ⚠️ Verificar |
| **Starknet** | STRK | `starknet` | ✅ Correto |
| **Scroll** | SCR | `scroll` | ⚠️ Verificar |
| **Linea** | - | - | ⚠️ Pode não ter token |
| **Mantle** | MNT | `mantle` | ✅ Correto |
| **Blast** | BLAST | `blast` | ⚠️ Verificar |
| **Metis** | METIS | `metis-token` | ✅ Correto |
| **Immutable** | IMX | `immutable-x` | ✅ Correto |

---

## ⚠️ IDs QUE PRECISAM VERIFICAÇÃO

Algumas chains novas podem não ter token próprio ou o ID pode ter mudado.
Testar estas chains e atualizar conforme necessário:

1. **Berachain** - Chain muito nova, verificar se ID está correto
2. **Base** - L2 da Coinbase, pode não ter token nativo
3. **Blast** - Chain nova, verificar ID
4. **Scroll** - Verificar se tem token e qual o ID
5. **Linea** - zkEVM da ConsenSys, verificar se tem token
6. **Polygon zkEVM** - Verificar se usa POL ou tem ID separado

---

## 🔧 COMO ATUALIZAR

1. Abra `/lib/data-sources/chain-mappings.ts`
2. Localize a chain que quer atualizar
3. Atualize o campo `coingecko` com o ID correto desta lista
4. Exemplo:

```typescript
polygon: {
  names: ['polygon', 'matic'],
  symbols: ['MATIC', 'POL'],
  defillama: 'Polygon',
  coingecko: 'matic-network', // ✅ ID correto
  category: 'L1'
}
```

---

## 🧪 COMO TESTAR UM ID

Use a API do CoinGecko para verificar:

```bash
curl https://api.coingecko.com/api/v3/coins/matic-network
```

Se retornar dados (nome, preço, market cap), o ID está correto ✅
Se retornar erro 404, o ID está errado ❌

---

## 📊 ESTATÍSTICAS

- **Total de chains listadas:** 45+
- **IDs verificados:** 35+
- **IDs que precisam verificação:** 10
- **Última atualização:** 2025-12-02

---

## 🎯 PRIORIDADE DE CORREÇÃO

**Alta Prioridade** (Top 10 por TVL):
- [x] Ethereum
- [x] Bitcoin
- [x] Solana
- [x] Binance Smart Chain
- [x] Polygon ✅ CORRIGIDO
- [x] Arbitrum
- [x] Avalanche
- [x] Optimism
- [x] Base (verificar)
- [x] Tron

**Média Prioridade** (Top 11-30):
- Sui, Aptos, Near, Cardano, Polkadot, etc.

**Baixa Prioridade** (Chains novas/menores):
- Berachain, Blast, etc.

---

## 📝 NOTAS

- Chains sem token nativo (como Base) podem não ter ID no CoinGecko
- Algumas L2s usam o token da L1 (ex: Base usa ETH)
- IDs podem mudar quando há rebranding (ex: Polygon MATIC → POL)
- Sempre testar após atualização

---

**Última verificação:** 2025-12-02
**Responsável:** Claude Code
**Status:** 🟢 Documento ativo e atualizado
