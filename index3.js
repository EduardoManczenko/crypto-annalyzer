#!/usr/bin/env node

/**
 * CRYPTO ANALYZER - Análise Profissional de Protocolos DeFi e Tokens
 * 
 * Package.json necessário:
 * {
 *   "name": "crypto-analyzer",
 *   "version": "1.0.0",
 *   "type": "module",
 *   "dependencies": {
 *     "axios": "^1.13.2",
 *     "chalk": "^5.6.2",
 *     "cli-table3": "^0.6.5",
 *     "ora": "^9.0.0"
 *   }
 * }
 * 
 * Instalação:
 * npm install
 * 
 * Uso:
 * node crypto-analyzer.js <nome-do-protocolo-ou-token>
 * 
 * Exemplos:
 * node crypto-analyzer.js bitcoin
 * node crypto-analyzer.js aave
 * node crypto-analyzer.js stellar
 */

import axios from 'axios';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';

// ==================== CONFIGURAÇÕES ====================
const API_ENDPOINTS = {
  defillama: {
    protocols: 'https://api.llama.fi/protocols',
    protocol: (slug) => `https://api.llama.fi/protocol/${slug}`,
    tvl: (protocol) => `https://api.llama.fi/tvl/${protocol}`,
    chains: 'https://api.llama.fi/v2/chains',
  },
  coingecko: {
    search: 'https://api.coingecko.com/api/v3/search',
    coin: (id) => `https://api.coingecko.com/api/v3/coins/${id}`,
    markets: (id) => `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`,
  }
};

// ==================== FUNÇÕES AUXILIARES ====================

function formatNumber(num) {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatPercent(num) {
  const color = num >= 0 ? chalk.green : chalk.red;
  const sign = num >= 0 ? '+' : '';
  return color(`${sign}${num.toFixed(2)}%`);
}

function getMarketCapCategory(mcap) {
  if (mcap >= 10e9) return { category: 'Large-Cap', risk: 'Baixo', color: chalk.green };
  if (mcap >= 1e9) return { category: 'Mid-Cap', risk: 'Médio', color: chalk.yellow };
  return { category: 'Small-Cap', risk: 'Alto', color: chalk.red };
}

function calculateRedFlags(data) {
  const flags = [];
  const warnings = [];
  const positives = [];

  // Supply Analysis
  if (data.circulating && data.total) {
    const circulatingPercent = (data.circulating / data.total) * 100;
    if (circulatingPercent < 30) {
      flags.push(`🚨 Apenas ${circulatingPercent.toFixed(1)}% em circulação - Alto risco de diluição!`);
    } else if (circulatingPercent < 50) {
      warnings.push(`⚠️  ${circulatingPercent.toFixed(1)}% em circulação - Risco moderado de diluição`);
    } else {
      positives.push(`✅ ${circulatingPercent.toFixed(1)}% em circulação - Boa distribuição`);
    }
  }

  // FDV/MCap Ratio
  if (data.fdv && data.marketCap) {
    const ratio = data.fdv / data.marketCap;
    if (ratio > 10) {
      flags.push(`🚨 FDV/MCap ratio de ${ratio.toFixed(1)}x - RISCO EXTREMO de diluição!`);
    } else if (ratio > 3) {
      warnings.push(`⚠️  FDV/MCap ratio de ${ratio.toFixed(1)}x - Risco elevado de diluição`);
    } else if (ratio < 1.5) {
      positives.push(`✅ FDV/MCap ratio de ${ratio.toFixed(1)}x - Baixo risco de diluição`);
    }
  }

  // Volume Analysis
  if (data.volume24h && data.marketCap) {
    const volumeRatio = (data.volume24h / data.marketCap) * 100;
    if (volumeRatio < 1) {
      flags.push(`🚨 Volume 24h de apenas ${volumeRatio.toFixed(2)}% do Market Cap - Liquidez MUITO baixa!`);
    } else if (volumeRatio < 5) {
      warnings.push(`⚠️  Volume 24h de ${volumeRatio.toFixed(2)}% do Market Cap - Liquidez baixa`);
    } else {
      positives.push(`✅ Volume 24h de ${volumeRatio.toFixed(2)}% do Market Cap - Boa liquidez`);
    }
  }

  // TVL Analysis (DeFi)
  if (data.tvl && data.marketCap) {
    const mcapTvlRatio = data.marketCap / data.tvl;
    if (mcapTvlRatio < 0.5) {
      positives.push(`✅ MCap/TVL de ${mcapTvlRatio.toFixed(2)} - Potencialmente subvalorizado!`);
    } else if (mcapTvlRatio > 3) {
      warnings.push(`⚠️  MCap/TVL de ${mcapTvlRatio.toFixed(2)} - Potencialmente sobrevalorizado`);
    }
  }

  // TVL Change Analysis
  if (data.tvlChange) {
    if (data.tvlChange['7d'] && data.tvlChange['7d'] < -20) {
      flags.push(`🚨 TVL caiu ${Math.abs(data.tvlChange['7d']).toFixed(1)}% em 7 dias - Fuga de capital!`);
    } else if (data.tvlChange['7d'] && data.tvlChange['7d'] > 20) {
      positives.push(`✅ TVL cresceu ${data.tvlChange['7d'].toFixed(1)}% em 7 dias - Forte entrada de capital!`);
    }
  }

  // Price Change Analysis
  if (data.priceChange) {
    if (data.priceChange['7d'] < -30) {
      warnings.push(`⚠️  Preço caiu ${Math.abs(data.priceChange['7d']).toFixed(1)}% em 7 dias - Alta volatilidade`);
    }
  }

  // Market Cap Category
  if (data.marketCap) {
    const { category, risk } = getMarketCapCategory(data.marketCap);
    if (risk === 'Alto') {
      warnings.push(`⚠️  ${category} - Maior risco e volatilidade`);
    } else if (risk === 'Baixo') {
      positives.push(`✅ ${category} - Projeto estabelecido`);
    }
  }

  return { flags, warnings, positives };
}

// ==================== BUSCA DE DADOS ====================

async function searchDeFiLlama(query) {
  const spinner = ora('Buscando no DeFiLlama...').start();
  try {
    const response = await axios.get(API_ENDPOINTS.defillama.protocols);
    const protocols = response.data;
    
    const found = protocols.find(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      spinner.succeed('Protocolo encontrado no DeFiLlama!');
      const detailResponse = await axios.get(API_ENDPOINTS.defillama.protocol(found.slug));
      return detailResponse.data;
    }
    
    spinner.info('Protocolo não encontrado no DeFiLlama');
    return null;
  } catch (error) {
    spinner.fail('Erro ao buscar no DeFiLlama');
    return null;
  }
}

async function searchCoinGecko(query) {
  const spinner = ora('Buscando no CoinGecko...').start();
  try {
    const searchResponse = await axios.get(API_ENDPOINTS.coingecko.search, {
      params: { query }
    });

    const coin = searchResponse.data.coins[0];
    if (!coin) {
      spinner.info('Token não encontrado no CoinGecko');
      return null;
    }

    const coinResponse = await axios.get(API_ENDPOINTS.coingecko.coin(coin.id));
    spinner.succeed('Token encontrado no CoinGecko!');
    return coinResponse.data;
  } catch (error) {
    spinner.fail('Erro ao buscar no CoinGecko');
    return null;
  }
}

// ==================== ANÁLISE E RELATÓRIO ====================

function generateReport(defiData, coinData) {
  console.log('\n');
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════════'));
  console.log(chalk.cyan.bold('          RELATÓRIO DE ANÁLISE PROFISSIONAL'));
  console.log(chalk.cyan.bold(`          Data: ${new Date().toLocaleString('pt-BR')}`));
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════════'));
  console.log('\n');

  // Dados Consolidados
  const data = {
    name: coinData?.name || defiData?.name || 'N/A',
    symbol: coinData?.symbol?.toUpperCase() || defiData?.symbol?.toUpperCase() || 'N/A',
    price: coinData?.market_data?.current_price?.usd || null,
    marketCap: coinData?.market_data?.market_cap?.usd || defiData?.mcap || null,
    fdv: coinData?.market_data?.fully_diluted_valuation?.usd || null,
    volume24h: coinData?.market_data?.total_volume?.usd || null,
    circulating: coinData?.market_data?.circulating_supply || null,
    total: coinData?.market_data?.total_supply || null,
    max: coinData?.market_data?.max_supply || null,
    tvl: defiData?.tvl?.[defiData.tvl.length - 1]?.totalLiquidityUSD || defiData?.chainTvls?.['Ethereum'] || null,
    tvlChange: {
      '1d': defiData?.change_1d || null,
      '7d': defiData?.change_7d || null,
      '30d': defiData?.change_1m || null,
    },
    priceChange: {
      '24h': coinData?.market_data?.price_change_percentage_24h || null,
      '7d': coinData?.market_data?.price_change_percentage_7d || null,
      '30d': coinData?.market_data?.price_change_percentage_30d || null,
    },
    chains: defiData?.chainTvls || null,
    category: defiData?.category || coinData?.categories?.[0] || 'N/A',
  };

  // ========== SEÇÃO 1: INFORMAÇÕES BÁSICAS ==========
  console.log(chalk.yellow.bold('📊 INFORMAÇÕES BÁSICAS'));
  console.log(chalk.gray('─'.repeat(65)));
  
  const basicTable = new Table({
    head: [chalk.white.bold('Métrica'), chalk.white.bold('Valor')],
    colWidths: [30, 35],
    style: { head: [], border: [] }
  });

  basicTable.push(
    ['Nome', chalk.white(data.name)],
    ['Símbolo', chalk.white(data.symbol)],
    ['Categoria', chalk.white(data.category)],
    ['Preço Atual', data.price ? chalk.green.bold(formatNumber(data.price)) : 'N/A']
  );

  console.log(basicTable.toString());
  console.log('\n');

  // ========== SEÇÃO 2: MÉTRICAS DE MERCADO ==========
  console.log(chalk.yellow.bold('💰 MÉTRICAS DE MERCADO'));
  console.log(chalk.gray('─'.repeat(65)));

  const marketTable = new Table({
    head: [chalk.white.bold('Métrica'), chalk.white.bold('Valor'), chalk.white.bold('Status')],
    colWidths: [25, 20, 20],
    style: { head: [], border: [] }
  });

  if (data.marketCap) {
    const { category, risk, color } = getMarketCapCategory(data.marketCap);
    marketTable.push(['Market Cap', formatNumber(data.marketCap), color(category)]);
  }
  
  if (data.fdv) {
    marketTable.push(['FDV (Full Diluted)', formatNumber(data.fdv), '-']);
  }

  if (data.volume24h) {
    marketTable.push(['Volume 24h', formatNumber(data.volume24h), '-']);
  }

  if (data.tvl) {
    marketTable.push(['TVL (Total Value Locked)', formatNumber(data.tvl), chalk.cyan('DeFi')]);
  }

  console.log(marketTable.toString());
  console.log('\n');

  // ========== SEÇÃO 3: SUPPLY ANALYSIS ==========
  if (data.circulating || data.total || data.max) {
    console.log(chalk.yellow.bold('📦 ANÁLISE DE SUPPLY'));
    console.log(chalk.gray('─'.repeat(65)));

    const supplyTable = new Table({
      head: [chalk.white.bold('Tipo de Supply'), chalk.white.bold('Quantidade'), chalk.white.bold('% do Máximo')],
      colWidths: [25, 20, 20],
      style: { head: [], border: [] }
    });

    if (data.circulating) {
      const pct = data.max ? ((data.circulating / data.max) * 100).toFixed(1) : '-';
      supplyTable.push(['Circulating Supply', data.circulating.toLocaleString(), pct + '%']);
    }

    if (data.total) {
      const pct = data.max ? ((data.total / data.max) * 100).toFixed(1) : '-';
      supplyTable.push(['Total Supply', data.total.toLocaleString(), pct + '%']);
    }

    if (data.max) {
      supplyTable.push(['Max Supply', data.max === null ? '∞ Infinito' : data.max.toLocaleString(), '100%']);
    } else {
      supplyTable.push(['Max Supply', chalk.yellow('∞ Infinito (sem limite!)'), '-']);
    }

    // Tokens Locked
    if (data.total && data.circulating) {
      const locked = data.total - data.circulating;
      const pctLocked = ((locked / data.total) * 100).toFixed(1);
      const color = pctLocked > 50 ? chalk.red : pctLocked > 30 ? chalk.yellow : chalk.green;
      supplyTable.push(['Tokens Locked', color(locked.toLocaleString()), color(pctLocked + '%')]);
    }

    console.log(supplyTable.toString());
    console.log('\n');
  }

  // ========== SEÇÃO 4: VARIAÇÕES DE PREÇO/TVL ==========
  console.log(chalk.yellow.bold('📈 VARIAÇÕES (PERFORMANCE)'));
  console.log(chalk.gray('─'.repeat(65)));

  const changesTable = new Table({
    head: [chalk.white.bold('Período'), chalk.white.bold('Preço'), chalk.white.bold('TVL')],
    colWidths: [15, 25, 25],
    style: { head: [], border: [] }
  });

  changesTable.push(
    [
      '24 horas',
      data.priceChange['24h'] ? formatPercent(data.priceChange['24h']) : 'N/A',
      data.tvlChange['1d'] ? formatPercent(data.tvlChange['1d']) : 'N/A'
    ],
    [
      '7 dias',
      data.priceChange['7d'] ? formatPercent(data.priceChange['7d']) : 'N/A',
      data.tvlChange['7d'] ? formatPercent(data.tvlChange['7d']) : 'N/A'
    ],
    [
      '30 dias',
      data.priceChange['30d'] ? formatPercent(data.priceChange['30d']) : 'N/A',
      data.tvlChange['30d'] ? formatPercent(data.tvlChange['30d']) : 'N/A'
    ]
  );

  console.log(changesTable.toString());
  console.log('\n');

  // ========== SEÇÃO 5: DISTRIBUIÇÃO DE TVL POR CHAIN ==========
  if (data.chains && Object.keys(data.chains).length > 0) {
    console.log(chalk.yellow.bold('🔗 DISTRIBUIÇÃO DE TVL POR BLOCKCHAIN'));
    console.log(chalk.gray('─'.repeat(65)));

    const chainTable = new Table({
      head: [chalk.white.bold('Blockchain'), chalk.white.bold('TVL'), chalk.white.bold('% do Total')],
      colWidths: [25, 20, 20],
      style: { head: [], border: [] }
    });

    const totalTvl = Object.values(data.chains).reduce((sum, tvl) => sum + (tvl || 0), 0);
    
    const sortedChains = Object.entries(data.chains)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 chains

    sortedChains.forEach(([chain, tvl]) => {
      if (tvl && tvl > 0) {
        const pct = ((tvl / totalTvl) * 100).toFixed(1);
        chainTable.push([chain, formatNumber(tvl), pct + '%']);
      }
    });

    console.log(chainTable.toString());
    console.log('\n');
  }

  // ========== SEÇÃO 6: RATIOS E MÉTRICAS AVANÇADAS ==========
  console.log(chalk.yellow.bold('🧮 RATIOS E MÉTRICAS AVANÇADAS'));
  console.log(chalk.gray('─'.repeat(65)));

  const ratiosTable = new Table({
    head: [chalk.white.bold('Métrica'), chalk.white.bold('Valor'), chalk.white.bold('Interpretação')],
    colWidths: [25, 15, 25],
    style: { head: [], border: [] }
  });

  // FDV/MCap Ratio
  if (data.fdv && data.marketCap) {
    const ratio = (data.fdv / data.marketCap).toFixed(2);
    const interpretation = ratio < 1.5 ? chalk.green('Ótimo') : 
                          ratio < 3 ? chalk.yellow('Razoável') : 
                          chalk.red('Alto Risco');
    ratiosTable.push(['FDV/Market Cap', ratio + 'x', interpretation]);
  }

  // MCap/TVL Ratio
  if (data.marketCap && data.tvl) {
    const ratio = (data.marketCap / data.tvl).toFixed(2);
    const interpretation = ratio < 0.5 ? chalk.green('Subvalorizado') : 
                          ratio < 2 ? chalk.yellow('Justo') : 
                          chalk.red('Sobrevalorizado');
    ratiosTable.push(['MCap/TVL', ratio, interpretation]);
  }

  // Volume/MCap Ratio
  if (data.volume24h && data.marketCap) {
    const ratio = ((data.volume24h / data.marketCap) * 100).toFixed(2);
    const interpretation = ratio < 1 ? chalk.red('Liquidez Baixa') : 
                          ratio < 10 ? chalk.yellow('Liquidez Média') : 
                          chalk.green('Alta Liquidez');
    ratiosTable.push(['Volume/MCap 24h', ratio + '%', interpretation]);
  }

  // Circulating %
  if (data.circulating && data.total) {
    const pct = ((data.circulating / data.total) * 100).toFixed(1);
    const interpretation = pct > 70 ? chalk.green('Boa Distribuição') : 
                          pct > 40 ? chalk.yellow('Moderada') : 
                          chalk.red('Alta Diluição');
    ratiosTable.push(['% em Circulação', pct + '%', interpretation]);
  }

  console.log(ratiosTable.toString());
  console.log('\n');

  // ========== SEÇÃO 7: ANÁLISE DE RISCO ==========
  const { flags, warnings, positives } = calculateRedFlags(data);

  // RED FLAGS
  if (flags.length > 0) {
    console.log(chalk.red.bold('🚨 RED FLAGS - RISCOS CRÍTICOS'));
    console.log(chalk.gray('─'.repeat(65)));
    flags.forEach(flag => console.log(chalk.red(flag)));
    console.log('\n');
  }

  // WARNINGS
  if (warnings.length > 0) {
    console.log(chalk.yellow.bold('⚠️  WARNINGS - PONTOS DE ATENÇÃO'));
    console.log(chalk.gray('─'.repeat(65)));
    warnings.forEach(warning => console.log(chalk.yellow(warning)));
    console.log('\n');
  }

  // PONTOS POSITIVOS
  if (positives.length > 0) {
    console.log(chalk.green.bold('✅ PONTOS POSITIVOS'));
    console.log(chalk.gray('─'.repeat(65)));
    positives.forEach(positive => console.log(chalk.green(positive)));
    console.log('\n');
  }

  // ========== SEÇÃO 8: SCORE DE RISCO ==========
  const riskScore = calculateRiskScore(flags.length, warnings.length, positives.length);
  console.log(chalk.yellow.bold('⭐ SCORE DE RISCO GERAL'));
  console.log(chalk.gray('─'.repeat(65)));
  
  const scoreTable = new Table({
    head: [chalk.white.bold('Categoria'), chalk.white.bold('Pontuação'), chalk.white.bold('Classificação')],
    colWidths: [20, 15, 30],
    style: { head: [], border: [] }
  });

  scoreTable.push(
    ['Red Flags', chalk.red(flags.length), flags.length === 0 ? chalk.green('✓ Nenhum') : chalk.red('✗ Atenção')],
    ['Warnings', chalk.yellow(warnings.length), warnings.length < 3 ? chalk.green('✓ Aceitável') : chalk.yellow('⚠ Moderado')],
    ['Pontos Positivos', chalk.green(positives.length), positives.length > 3 ? chalk.green('✓ Excelente') : chalk.yellow('○ Regular')],
    ['', '', ''],
    ['SCORE FINAL', chalk.bold(riskScore.score + '/100'), riskScore.color(riskScore.classification)]
  );

  console.log(scoreTable.toString());
  console.log('\n');

  // ========== RECOMENDAÇÃO FINAL ==========
  console.log(chalk.cyan.bold('💡 RECOMENDAÇÃO'));
  console.log(chalk.gray('─'.repeat(65)));
  console.log(riskScore.recommendation);
  console.log('\n');

  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════════'));
  console.log(chalk.gray('Análise gerada por Crypto Analyzer - Use por sua conta e risco'));
  console.log(chalk.gray('Sempre faça sua própria pesquisa (DYOR) antes de investir'));
  console.log(chalk.cyan.bold('═══════════════════════════════════════════════════════════════'));
  console.log('\n');
}

function calculateRiskScore(redFlags, warnings, positives) {
  let score = 50; // Base score

  // Penalties
  score -= redFlags * 15; // -15 por red flag
  score -= warnings * 5;  // -5 por warning
  
  // Bonuses
  score += positives * 8; // +8 por ponto positivo

  // Clamp entre 0-100
  score = Math.max(0, Math.min(100, score));

  let classification, color, recommendation;

  if (score >= 80) {
    classification = 'EXCELENTE - Baixo Risco';
    color = chalk.green.bold;
    recommendation = chalk.green('Projeto com fundamentos sólidos. Adequado para investidores conservadores e de longo prazo.');
  } else if (score >= 60) {
    classification = 'BOM - Risco Moderado';
    color = chalk.cyan.bold;
    recommendation = chalk.cyan('Projeto com bons fundamentos, mas com alguns pontos de atenção. Adequado para perfil moderado.');
  } else if (score >= 40) {
    classification = 'REGULAR - Risco Elevado';
    color = chalk.yellow.bold;
    recommendation = chalk.yellow('Projeto com riscos significativos. Apenas para investidores experientes e com tolerância a risco.');
  } else if (score >= 20) {
    classification = 'RUIM - Alto Risco';
    color = chalk.red.bold;
    recommendation = chalk.red('Projeto com múltiplos red flags. Alto risco de perda. Considere evitar ou investir apenas quantias mínimas.');
  } else {
    classification = 'PÉSSIMO - Risco Extremo';
    color = chalk.red.bold;
    recommendation = chalk.red.bold('⚠️  EVITE! Múltiplos red flags críticos identificados. Risco extremo de perda total do capital.');
  }

  return { score, classification, color, recommendation };
}

// ==================== FUNÇÃO PRINCIPAL ====================

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.log(chalk.red('❌ Erro: Você precisa fornecer um nome de protocolo ou token!'));
    console.log(chalk.yellow('Uso: node crypto-analyzer.js <nome>'));
    console.log(chalk.gray('Exemplos:'));
    console.log(chalk.gray('  node crypto-analyzer.js bitcoin'));
    console.log(chalk.gray('  node crypto-analyzer.js aave'));
    console.log(chalk.gray('  node crypto-analyzer.js stellar'));
    process.exit(1);
  }

  console.log(chalk.cyan.bold('\n🔍 CRYPTO ANALYZER - Iniciando análise...\n'));
  console.log(chalk.gray(`Buscando informações sobre: ${chalk.white.bold(query)}`));
  console.log('\n');

  // Buscar em paralelo
  const [defiData, coinData] = await Promise.all([
    searchDeFiLlama(query),
    searchCoinGecko(query)
  ]);

  if (!defiData && !coinData) {
    console.log(chalk.red('\n❌ Nenhum dado encontrado para "' + query + '"'));
    console.log(chalk.yellow('Verifique o nome e tente novamente.'));
    process.exit(1);
  }

  // Gerar relatório
  generateReport(defiData, coinData);
}

// Executar
main().catch(error => {
  console.error(chalk.red('❌ Erro inesperado:'), error.message);
  process.exit(1);
});