/**
 * Sistema de busca fuzzy para matching inteligente
 * Permite encontrar resultados mesmo com typos ou nomes parciais
 */

interface Searchable {
  id: string
  name: string
  symbol?: string
  aliases?: string[]
}

/**
 * Calcula distância de Levenshtein entre duas strings
 * Usado para fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return matrix[len1][len2]
}

/**
 * Calcula score de similaridade entre query e target (0-100)
 */
function calculateSimilarity(query: string, target: string): number {
  const queryLower = query.toLowerCase()
  const targetLower = target.toLowerCase()

  // Match exato = 100
  if (queryLower === targetLower) return 100

  // Match no início = 95
  if (targetLower.startsWith(queryLower)) return 95

  // Contains = 85
  if (targetLower.includes(queryLower)) return 85

  // Fuzzy match baseado em Levenshtein
  const distance = levenshteinDistance(queryLower, targetLower)
  const maxLen = Math.max(query.length, target.length)
  const similarity = ((maxLen - distance) / maxLen) * 70 // Max 70 para fuzzy

  return similarity
}

/**
 * Busca fuzzy em lista de items
 * Retorna items ordenados por relevância com score
 */
export function fuzzySearch<T extends Searchable>(
  query: string,
  items: T[],
  threshold: number = 30 // Score mínimo para considerar match
): Array<T & { score: number }> {
  const results: Array<T & { score: number }> = []

  for (const item of items) {
    let maxScore = 0

    // Testar contra nome
    const nameScore = calculateSimilarity(query, item.name)
    maxScore = Math.max(maxScore, nameScore)

    // Testar contra símbolo
    if (item.symbol) {
      const symbolScore = calculateSimilarity(query, item.symbol)
      maxScore = Math.max(maxScore, symbolScore)
    }

    // Testar contra aliases
    if (item.aliases) {
      for (const alias of item.aliases) {
        const aliasScore = calculateSimilarity(query, alias)
        maxScore = Math.max(maxScore, aliasScore)
      }
    }

    // Adicionar se passar threshold
    if (maxScore >= threshold) {
      results.push({
        ...item,
        score: maxScore
      })
    }
  }

  // Ordenar por score (maior primeiro)
  return results.sort((a, b) => b.score - a.score)
}

/**
 * Normaliza string para busca (remove acentos, espaços extras, etc)
 */
export function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .trim()
}
