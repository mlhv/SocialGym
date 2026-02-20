# SocialGym 🧠💬

An event-driven, AI-powered conversational simulator built with a polyglot microservices architecture. 

SocialGym provides a real-time chat interface where users can practice social scenarios (like debate, dating, or networking) with an AI agent. Behind the scenes, a decoupled machine learning pipeline performs real-time Natural Language Processing (NLP) sentiment analysis on the conversation without blocking the main application thread.

## 🏗️ System Architecture

![SocialGym Architecture](./assets/architecture.png)

1. **Real-Time UI:** The React frontend maintains a full-duplex **WebSocket (STOMP)** connection with the Spring Boot backend, ensuring sub-millisecond chat latency.
2. **Core Backend:** **Spring Boot** handles business logic, saves raw messages to **PostgreSQL**, and acts as a message producer.
3. **Event Streaming:** Instead of synchronous blocking API calls, Spring Boot publishes chat events to an **Apache Kafka** cluster.
4. **Asynchronous ML:** A dedicated **Python** microservice consumes events from Kafka, runs a Hugging Face / PyTorch sentiment analysis model, and updates the database via a REST Webhook. 
5. **Smart Upserts:** The backend broadcasts the ML-enriched data back over the WebSocket, and the React UI dynamically updates existing messages in-place without requiring a page refresh.

## 🚀 Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, Recharts, SockJS/STOMP
* **Backend:** Java, Spring Boot, Spring Data JPA, Spring WebSockets
* **ML Microservice:** Python 3, PyTorch, Hugging Face Transformers
* **Infrastructure:** PostgreSQL, Apache Kafka (KRaft mode), Docker & Docker Compose

## 🛠️ Quick Start (Local Deployment)

This entire 5-tier architecture is fully containerized. You can spin up the UI, Backend, Database, Message Broker, and ML Engine with a single command.

### 1. Set up Environment Variables
Duplicate the provided `.env.example` file, rename it to `.env`, and insert your OpenAI API key:
```bash
cp .env.example .env

