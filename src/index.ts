import { askUserQuestion } from './chat';
import * as readline from 'readline';
import { extractPageText } from './scrape';
import { extractUrlsFromSitemap } from './sitemap';
import { processAndStore } from './embed';

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('🔗 Please enter a URL or sitemap URL to scrape:');
  
  const userInput = await new Promise<string>((resolve) => {
    rl.question('', (answer) => {
      resolve(answer.trim());
    });
  });

  console.log('🔄 Processing the provided URL...');

  try {
    const urls = await extractUrlsFromSitemap(userInput);
    
    if (urls.length > 0) {
      console.log(`📋 Sitemap detected. Found ${urls.length} URLs to process.`);
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`⏳ Processing ${i + 1}/${urls.length}: ${url}`);
        
        try {
          const { text } = await extractPageText(url);
          await processAndStore(url, text);
        } catch (err) {
          console.error(`❌ Error processing ${url}:`, err);
        }
      }
    } else {
      throw new Error('No URLs found in sitemap');
    }
  } catch (err) {
    console.log('🔗 Treating as single URL...');
    
    try {
      const { text } = await extractPageText(userInput);
      await processAndStore(userInput, text);
      console.log('✅ Single URL processed successfully.');
    } catch (error) {
      console.error('❌ Error processing URL:', error);
      rl.close();
      process.exit(1);
    }
  }

  console.log('✅ All processing completed!');
  console.log('💬 Local search bot online. Type your question or "exit" to quit.');

  rl.on('line', async (input) => {
    if (input.toLowerCase().trim() === 'exit') {
      console.log('👋 See you soon!');
      rl.close();
      process.exit(0);
    }

    try {
      await askUserQuestion(input);
    } catch (err) {
      console.error('❌ Error during the request :', err);
    }

    rl.prompt();
  });

  rl.prompt();
}

main().catch(console.error);
