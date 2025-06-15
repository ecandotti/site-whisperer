import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OllamaEmbeddings } from '@langchain/ollama';
import { Pool } from 'pg';
import { DATABASE_URL, EMBEDDING_MODEL } from '@/constants';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

const embedder = new OllamaEmbeddings({
  model: EMBEDDING_MODEL,
});

export async function processAndStore(url: string, rawText: string) {
  const alreadyExists = await pool.query('SELECT 1 FROM documents WHERE url = $1 LIMIT 1', [url]);
  if (alreadyExists?.rowCount && alreadyExists.rowCount > 0) {
    console.log(`⏩ Skipped (already in database) : ${url}`);
    return;
  }

  const docs = await splitter.createDocuments([rawText]);
  const contents = docs.map((doc) => doc.pageContent);
  const embeddings = await embedder.embedDocuments(contents);

  for (let i = 0; i < contents.length; i++) {
    await pool.query('INSERT INTO documents (content, embedding, url) VALUES ($1, $2, $3)', [
      contents[i],
      `[${embeddings[i].join(',')}]`,
      url,
    ]);
  }

  console.log(`✅ ${contents.length} chunks insérés pour ${url}`);
}
