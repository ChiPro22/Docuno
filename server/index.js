import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Start the worker in the same process for development simplicity
import './worker.js';

dotenv.config();
const PORT = process.env.PORT || 8000;

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Redis connection for the Queue
const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });

// Create the Job Queue
const queue = new Queue('file-upload-queue', { connection });

// Initialize Embeddings (Mistral)
const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey: process.env.MISTRAL_API_KEY,
});

// Connect to Qdrant Vector Database
// Note: You must create a collection named 'pdf-docs' in your Qdrant dashboard first!
const vectorStore = await QdrantVectorStore.fromExistingCollection(
  embeddings,
  {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: "pdf-docs",
  }
);

// Configure File Upload (Multer)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + file.originalname);
  }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
  res.send('Docuno Server is Running!');
});

// --- Route 1: Upload PDF ---
app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Add job to the queue for background processing
    await queue.add('file-upload-queue', {
      filename: req.file.originalname,
      path: req.file.path,
    });

    return res.status(200).json({
      message: 'PDF uploaded successfully and queued for processing',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// --- Route 2: Chat ---
app.post('/chat', async (req, res) => {
  try {
    const userQuery = req.body.query;
    if (!userQuery) {
      return res.status(400).json({ error: "Query is required" });
    }

    // 1. Retrieve relevant chunks from Qdrant
    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(userQuery);

    // 2. Build the prompt for Gemini
    const SYSTEM_PROMPT = `
      You are a helpful AI assistant for the Docuno application.
      Answer the user's question using ONLY the provided context chunks from the PDF.
      
      If the answer is not in the context, say "I cannot find the answer in the document."

      Context:
      ${JSON.stringify(result)}

      User Question:
      ${userQuery}
    `;

    // 3. Generate response
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: SYSTEM_PROMPT
    });

    return res.status(200).json({
      assistant_response: geminiResponse
    });

  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});