import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 5000;
const MONGO_URI = process.env.MONGO_URI ?? '';

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect to database
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch((error) => console.error('❌ MongoDB connection failed:', error));

app.get('/', (req, res) => {
  res.send({ message: 'Server is running 🚀' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
