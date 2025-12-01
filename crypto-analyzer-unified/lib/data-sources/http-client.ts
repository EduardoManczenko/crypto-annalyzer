/**
 * HTTP Client robusto usando https nativo do Node.js
 * Funciona melhor em ambientes com restrições de rede
 */

import https from 'https';
import http from 'http';

interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Faz requisição HTTP/HTTPS usando módulos nativos do Node.js
 */
export async function httpGet(url: string, options: FetchOptions = {}): Promise<any> {
  const { timeout = 15000, headers = {} } = options;

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      ...headers
    };

    const req = client.get(url, {
      headers: defaultHeaders,
      timeout
    }, (res) => {
      let data = '';

      // Verificar código de status
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      // Coletar dados
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Processar resposta completa
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Failed to parse JSON'));
        }
      });
    });

    // Timeout
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Erro
    req.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Faz requisição para obter HTML (para scraping)
 */
export async function httpGetHTML(url: string, options: FetchOptions = {}): Promise<string> {
  const { timeout = 20000, headers = {} } = options;

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      ...headers
    };

    const req = client.get(url, {
      headers: defaultHeaders,
      timeout
    }, (res) => {
      let data = '';

      // Verificar código de status
      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      // Coletar dados
      res.on('data', (chunk) => {
        data += chunk;
      });

      // Retornar HTML completo
      res.on('end', () => {
        resolve(data);
      });
    });

    // Timeout
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    // Erro
    req.on('error', (error) => {
      reject(error);
    });
  });
}
