/**
 * Sistema de cache persistente em disco para dados de crypto
 * Garante que dados sejam mantidos entre deploys e restarts
 */

import fs from 'fs/promises'
import path from 'path'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

const CACHE_DIR = path.join(process.cwd(), '.cache')

/**
 * Garante que diretório de cache existe
 */
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
  } catch (error) {
    console.error('[Cache] Erro ao criar diretório:', error)
  }
}

/**
 * Gera nome de arquivo seguro a partir de uma chave
 */
function getCacheFileName(key: string): string {
  // Remove caracteres perigosos e limita tamanho
  const safeKey = key
    .replace(/[^a-z0-9-_]/gi, '_')
    .substring(0, 200)
  return `${safeKey}.json`
}

/**
 * Salva dados no cache com TTL
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  ttlSeconds: number = 3600
): Promise<void> {
  try {
    await ensureCacheDir()

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlSeconds * 1000)
    }

    const fileName = getCacheFileName(key)
    const filePath = path.join(CACHE_DIR, fileName)

    await fs.writeFile(filePath, JSON.stringify(entry), 'utf-8')
    console.log(`[Cache] ✓ Salvo: ${key} (TTL: ${ttlSeconds}s)`)
  } catch (error) {
    console.error('[Cache] Erro ao salvar:', error)
  }
}

/**
 * Busca dados do cache (retorna null se expirado ou não encontrado)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const fileName = getCacheFileName(key)
    const filePath = path.join(CACHE_DIR, fileName)

    const content = await fs.readFile(filePath, 'utf-8')
    const entry: CacheEntry<T> = JSON.parse(content)

    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      console.log(`[Cache] ✗ Expirado: ${key}`)
      // Deletar arquivo expirado
      await fs.unlink(filePath).catch(() => {})
      return null
    }

    const age = ((Date.now() - entry.timestamp) / 1000 / 60).toFixed(1)
    console.log(`[Cache] ✓ Hit: ${key} (idade: ${age}min)`)
    return entry.data
  } catch (error) {
    // Arquivo não existe ou erro ao ler
    return null
  }
}

/**
 * Remove entrada específica do cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    const fileName = getCacheFileName(key)
    const filePath = path.join(CACHE_DIR, fileName)
    await fs.unlink(filePath)
    console.log(`[Cache] ✓ Deletado: ${key}`)
  } catch (error) {
    // Ignora erros (arquivo pode não existir)
  }
}

/**
 * Limpa todo o cache
 */
export async function cacheClear(): Promise<void> {
  try {
    const files = await fs.readdir(CACHE_DIR)
    await Promise.all(
      files.map(file => fs.unlink(path.join(CACHE_DIR, file)))
    )
    console.log(`[Cache] ✓ Cache limpo (${files.length} arquivos)`)
  } catch (error) {
    console.error('[Cache] Erro ao limpar:', error)
  }
}

/**
 * Remove entradas expiradas do cache
 */
export async function cacheCleanup(): Promise<void> {
  try {
    const files = await fs.readdir(CACHE_DIR)
    let cleaned = 0

    for (const file of files) {
      try {
        const filePath = path.join(CACHE_DIR, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const entry: CacheEntry<any> = JSON.parse(content)

        if (Date.now() > entry.expiresAt) {
          await fs.unlink(filePath)
          cleaned++
        }
      } catch (error) {
        // Arquivo corrompido, deletar
        await fs.unlink(path.join(CACHE_DIR, file)).catch(() => {})
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`[Cache] ✓ Cleanup: ${cleaned} arquivos removidos`)
    }
  } catch (error) {
    console.error('[Cache] Erro no cleanup:', error)
  }
}

/**
 * Wrapper para buscar dados com cache automático
 * Se cache existe e é válido, retorna. Senão, executa fetcher e salva no cache.
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // Tentar buscar do cache primeiro
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    return cached
  }

  // Cache miss - buscar dados
  console.log(`[Cache] Miss: ${key} - buscando...`)
  const data = await fetcher()

  // Salvar no cache (não aguardar)
  cacheSet(key, data, ttlSeconds).catch(err => {
    console.error('[Cache] Erro ao salvar após fetch:', err)
  })

  return data
}
