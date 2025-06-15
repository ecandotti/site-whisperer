# Site Whisperer

A local chatbot that becomes an expert on any website by scraping its content and using local LLM models through Ollama. This project demonstrates how to build a completely local AI system without depending on external APIs like OpenAI or Claude.

## Overview

This chatbot:
1. **Scrapes** content from a website or sitemap
2. **Processes** the content into chunks and creates embeddings
3. **Stores** embeddings in a local PostgreSQL database with pgvector
4. **Answers** questions using retrieved context and a local LLM

All processing happens locally - no data leaves your machine.

## Architecture

```
User Input (URL/Sitemap) → Scraper → Text Chunking → Embeddings → PostgreSQL (pgvector)
                                                                            ↓
User Questions → Query Embedding → Similarity Search → Context Retrieval → Local LLM → Answer
```

## Prerequisites

### 1. Ollama Installation
Install [Ollama](https://ollama.ai/) and pull the required models:

```bash
# Install the embedding model
ollama pull nomic-embed-text

# Install the chat model
ollama pull mistral
```

### 2. Docker & Docker Compose
Required for running the PostgreSQL database with pgvector extension.

### 3. Node.js & Yarn
Node.js 18+ and Yarn package manager.

## Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd site-whisperer
yarn install
```

2. **Start the database:**
```bash
docker-compose up -d
```

3. **Verify Ollama models are available:**
```bash
ollama list
# Should show: nomic-embed-text and mistral
```

## Usage

### 1. Start the application:
```bash
yarn dev
```

### 2. Provide a URL or sitemap:
When prompted, enter either:
- A single webpage URL: `https://example.com/page`
- A sitemap URL: `https://example.com/sitemap.xml`

The bot will:
- Detect if it's a sitemap and extract all URLs
- Scrape each page using Mozilla Readability for clean text extraction
- Process content into 500-character chunks with 50-character overlap
- Generate embeddings and store in the database

### 3. Chat with the bot:
Once processing is complete, ask questions about the scraped content:
```
💬 Local search bot online. Type your question or "exit" to quit.
> What is the main topic of this website?
> How do I contact support?
> exit
```

## Project Structure

```
src/
├── index.ts      # Main application entry point
├── constants.ts  # Configuration and prompt templates
├── sitemap.ts    # Sitemap parsing and URL extraction
├── scrape.ts     # Web scraping with Readability
├── embed.ts      # Text chunking and embedding generation
└── chat.ts       # Question answering with context retrieval
```

## Key Features

- **Local-first**: No external API calls, complete data privacy
- **Smart scraping**: Uses Mozilla Readability for clean text extraction
- **Efficient storage**: Chunks overlap for better context retrieval
- **Duplicate prevention**: Skips already processed URLs
- **Error handling**: Graceful handling of 404s and connection errors
- **Interactive CLI**: Simple command-line interface

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **LLM Framework**: LangChain with Ollama
- **Database**: PostgreSQL with pgvector extension
- **Scraping**: Axios + JSDOM + Mozilla Readability
- **Text Processing**: RecursiveCharacterTextSplitter
- **Models**: 
  - Embedding: `nomic-embed-text` (768 dimensions)
  - Chat: `mistral`

## Configuration

The application uses these default settings (in `src/constants.ts`):
- Embedding model: `nomic-embed-text`
- Chat model: `mistral`
- Chunk size: 500 characters
- Chunk overlap: 50 characters
- Database: Local PostgreSQL on port 5444
- Retrieved contexts per query: 4

## Database Schema

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(768),
  url TEXT
);
```

## Development

```bash
# Development with auto-reload
yarn dev

# Build TypeScript
yarn build

# Production start
yarn start
```

## Troubleshooting

**Ollama models not found:**
```bash
ollama pull nomic-embed-text
ollama pull mistral
```

**Database connection issues:**
```bash
docker-compose down
docker-compose up -d
```

**Port conflicts:**
Edit `docker-compose.yml` to change the PostgreSQL port from 5444 to another port.

## Use Cases

- Create a customer support bot for your website
- Build a documentation assistant
- Personal knowledge base from blog articles
- Research assistant for specific domains
- Internal company knowledge chatbot

## Privacy & Security

- All data processing happens locally
- No external API calls once models are downloaded
- Website content stored in your local database
- Complete control over your data and models 