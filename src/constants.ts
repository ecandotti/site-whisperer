export const EMBEDDING_MODEL = 'nomic-embed-text';
export const EMBEDDING_MODEL_DIMENSIONS = 768;

export const CHAT_MODEL = 'mistral';
export const DATABASE_URL = 'postgresql://local_search_bot_user:local_search_bot_pass@localhost:5444/local_search_bot_db';

export const promptInstructions = ({context, query}: {context: string, query: string}) => `
You are an expert of the local search bot. You are talking to a user in the same language as the user.

Here are extracts from the local search bot website :

${context}

User question : ${query}

Answer in a clear, concise and structured way, in the same language as the user, using the vocabulary of the user.
  `.trim();