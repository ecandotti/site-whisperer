import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { Pool } from 'pg';
import { DATABASE_URL, CHAT_MODEL, EMBEDDING_MODEL, promptInstructions } from '@/constants';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const model = new ChatOllama({ model: CHAT_MODEL });
const embedder = new OllamaEmbeddings({ model: EMBEDDING_MODEL });

async function getRelevantChunks(queryEmbedding: number[], k = 4): Promise<string[]> {
  const res = await pool.query('SELECT content FROM documents ORDER BY embedding <-> $1 LIMIT $2', [
    `[${queryEmbedding.join(',')}]`,
    k,
  ]);
  return res.rows.map((r) => r.content);
}

export async function askUserQuestion(query: string) {
  console.log(`🔍 Question : ${query}`);
  const queryEmbedding = await embedder.embedQuery(query);
  const contexts = await getRelevantChunks(queryEmbedding);

  const contextBlock = contexts.map((ctx, i) => `Contexte ${i + 1}:\n${ctx}`).join('\n\n');

  const prompt = promptInstructions({ context: contextBlock, query });

  const res = await model.invoke(prompt);
  console.log(`💬 Answer :\n${res.content}`);
}
