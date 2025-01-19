import express from 'express';
import { setRoutes } from './routes/index';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

setRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;