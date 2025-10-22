import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get('/',(req,res)=>{
    res.send('Hello World!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});