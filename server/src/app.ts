import express, { Request, Response } from "express"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/globalErrorHandler.js";
import router from "./routes/index.js";
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "https://manbazar.com",
        "https://www.manbazar.com",
        "https://admin.manbazar.com",
        "https://www.admin.manbazar.com"
    ],
    credentials: true,
}));




import { carrybeeWebhookController } from "./modules/courier/courier.webhook.controller.js";

// Application routes
app.use('/api/v1', router);

// CarryBee Webhook URL endpoint as documented: /api/webhook/cashback
app.post('/api/webhook/cashback', carrybeeWebhookController);
app.post('/api/webhook/carrybee', carrybeeWebhookController);




// Testing route
app.get('/', (req: Request, res: Response) => {
    res.send('Server is running!');
});



app.use(notFound)
app.use(errorHandler)


export default app