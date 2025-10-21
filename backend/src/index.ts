import express from 'express';
import cors from 'cors';
import { otpRouter } from './routes/otp';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'into-the-wild-backend' });
});

// OTP routes for carpooling
app.use('/api/routing', otpRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

