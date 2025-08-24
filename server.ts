// Minimal Express server for Render backend
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Example endpoint for your game (expand as needed)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Add more endpoints for game logic, webhooks, etc. here

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
