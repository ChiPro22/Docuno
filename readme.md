# Docuno 📄🤖

> **Talk to Your PDFs, Get Instant Answers**

Docuno is an intelligent AI-powered RAG (Retrieval-Augmented Generation) application that transforms how you interact with documents. Upload any PDF and engage in natural conversations to extract insights, summaries, and specific information instantly.

## 🌟 Features

- **💬 Chat with PDFs**: Ask questions and get context-aware answers from your documents.
- **⚡ Asynchronous Processing**: Fast uploads with background PDF processing using a Redis job queue.
- **🔍 Smart Retrieval**: Uses vector embeddings to find the most relevant content for your questions.
- **🧠 Advanced AI**: Powered by Google Gemini for reasoning and Mistral AI for semantic search.
- **🔐 Secure**: Full user authentication and session management via Clerk.
- **🎨 Modern UI**: Responsive and clean interface built with React, Vite, and Tailwind CSS.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Queue System**: BullMQ & Redis (Upstash)
- **File Handling**: Multer

### AI & Database
- **LLM**: Google Gemini 2.5 Flash
- **Embeddings**: Mistral AI
- **Vector Database**: Qdrant
- **Orchestration**: LangChain

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Redis instance (e.g., Upstash)
- Qdrant Cluster (Free tier on Qdrant Cloud)
- API Keys for:
  - Google AI Studio (Gemini)
  - Mistral AI
  - Clerk (Publishable Key)

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/docuno.git](https://github.com/YOUR_USERNAME/docuno.git)
cd docuno