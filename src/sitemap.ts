import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export async function extractUrlsFromSitemap(sitemapUrl: string): Promise<string[]> {
  const res = await axios.get(sitemapUrl, {
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

  const parsed = await parseStringPromise(res.data);

  const urls: string[] = parsed.urlset.url.map((entry: any) => entry.loc[0]);
  return urls.filter(url => url.startsWith('https://'));
}
