import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function extractPageText(url: string): Promise<{ url: string; text: string } | null> {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                      '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'fr-FR,fr;q=0.9'
      },
      timeout: 10000,
      maxRedirects: 5,
      decompress: true
    });
    const dom = new JSDOM(res.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent || article.textContent.trim().length < 100) {
      console.log(`⚠️ Texte trop court pour ${url}, passage au suivant`);
      return null;
    }

    return {
      url,
      text: article.textContent.trim()
    };
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`⚠️ Page 404 pour ${url}, passage au suivant`);
      return null;
    }
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ERR_BAD_REQUEST') {
      console.log(`⚠️ Erreur de connexion pour ${url}, passage au suivant`);
      return null;
    }
    console.error(`❌ Erreur lors de l'extraction de ${url}`, error.message);
    throw error;
  }
}
