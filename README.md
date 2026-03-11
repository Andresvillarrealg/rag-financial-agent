# Intelligent RAG Analysis Agent

A comprehensive **Retrieval-Augmented Generation (RAG)** system designed for the ingestion, vectorization, and interactive analysis of corporate documents (PDF and TXT). This automation solution enables users to "converse" with their data while ensuring **grounded responses** based exclusively on the provided context, minimizing hallucinations.

## System Architecture

The project is built with a modern, modular, containerized architecture that clearly separates responsibilities:

* **Frontend (React.js):** A reactive user interface for asynchronous document uploads and real-time chat visualization.
* **Backend (FastAPI):** An asynchronous Python server that exposes RESTful endpoints for communication between the client and the AI engine. It supports text file processing and PDF metadata extraction using `pypdf`.
* **AI Engine (LangChain & OpenAI):** A logical orchestrator responsible for document chunking (`RecursiveCharacterTextSplitter`), embedding generation, and **Prompt Engineering** design.
* **Vector Database (FAISS):** A high-efficiency local storage system for similarity search.
* **Infrastructure (Docker & Docker Compose):** Full containerization that ensures reproducible environments. It includes **persistent volumes** to prevent the loss of the vector index between server restarts.

## Key Features

1. **Multi-Format Ingestion:** Native support for reading and extracting text from `.txt` and `.pdf` files.
2. **Persistent Memory:** The FAISS vector index is stored in a Docker-mounted local volume, allowing the system to retain knowledge without needing to reprocess documents after shutting down the system.
3. **Hallucination Mitigation:** The agent is instructed (via System Prompt) to respond strictly using the retrieved fragments from the vector database.
4. **Isolated Deployment:** Low-level dependency resolution is automatically managed through the Dockerization layer.

## Installation and Execution Guide

### Prerequisites
* [Docker](https://www.docker.com/) and Docker Compose installed.
* An API Key from [OpenAI](https://platform.openai.com/).

### Steps

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/your-repository.git
cd your-repository
```

**2. Configure environment variables:**
In the `/backend` folder, create a file named `.env` and add your OpenAI key:

```env
OPENAI_API_KEY=sk-your_secret_key_here
```

**3. Build and start the infrastructure:**
Run the following command in the root of the project to download images, build the environment, and start the servers:

```bash
docker compose up --build
```

**4. Using the application:**
* Open your browser and go to `http://localhost:5173`.
* In the **Data Ingestion** section, select a PDF or TXT file and click **Upload to FAISS**.
* Once processed, use the chat at the bottom to ask analytical questions about the document.
