import express, { Request, Response } from "express"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/globalErrorHandler.js";
import router from "./routes/index.js";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    credentials: true,
}));




// Application routes
app.use('/api/v1', router);




// Testing route
app.get('/', (req: Request, res: Response) => {
    res.send('Server is running!');
});



app.use(notFound)
app.use(errorHandler)


export default app