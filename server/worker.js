import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; // <--- CHANGED THIS
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { Document } from "@langchain/core/documents";
import fs from 'fs/promises';
import * as dotenv from 'dotenv';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

async function extractTextFromPDF(buffer) {
  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const pdfDocument = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    // Join with space to prevent words running together
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return {
    text: fullText,
    numpages: pdfDocument.numPages
  };
}

const worker = new Worker(
  'file-upload-queue',
  async job => {
    try {
      console.log(`Processing job ${job.id}: ${job.data.filename}`);

      // 1. Read file
      const fileBuffer = await fs.readFile(job.data.path);

      // 2. Extract text
      const pdfData = await extractTextFromPDF(fileBuffer);
      
      if (!pdfData.text.trim()) {
        throw new Error("Failed to extract text from PDF (it might be empty or scanned images)");
      }

      // 3. Create Document
      const doc = new Document({
        pageContent: pdfData.text,
        metadata: { 
          source: job.data.path,
          pdf_numpages: pdfData.numpages
        }
      });

      // 4. Split (UPDATED)
      // RecursiveCharacterTextSplitter is much better at handling messy PDF text
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,      // Characters per chunk
        chunkOverlap: 200,    // Overlap to keep context
      });
      
      const chunks = await splitter.splitDocuments([doc]);
      console.log(`PDF split into ${chunks.length} chunks`);

      // 5. Embed
      const embeddings = new MistralAIEmbeddings({
        model: "mistral-embed",
        apiKey: process.env.MISTRAL_API_KEY,
      });

      // 6. Store
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL,
          apiKey: process.env.QDRANT_API_KEY,
          collectionName: "pdf-docs",
        }
      );

      await vectorStore.addDocuments(chunks);
      console.log(`Successfully embedded and stored in Qdrant!`);

    } catch (error) {
      console.error('Job failed:', error);
      throw error;
    }
  },
  { connection }
);

console.log("Worker started and listening for jobs...");