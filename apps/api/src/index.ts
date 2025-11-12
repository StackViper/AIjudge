// Load environment variables from .env file FIRST
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

const app = express();

// CORS Configuration - Allow frontend requests
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const port = process.env.PORT || 8080;

// Dynamically import routes AFTER env vars are loaded
const startServer = async () => {
  const { default: v1Router } = await import("./routes/v1/index.js");
  app.use("/api/v1", v1Router);
  
  app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
};

startServer().catch(console.error);