import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { errorMiddleware } from '../../../packages/error-handler/middleware';
import router from './routes/order.route';
import { createOrder } from './controllers/order.controller';

const app = express();
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      if (req.originalUrl === "/api/create-order") {
        req.rawBody = buf;
      }
    }
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to order-service!' });
});
app.post("/api/create-order", createOrder);

app.use("/order", router);

app.use(errorMiddleware)

const port = process.env.PORT || 6004;
const server = app.listen(port, () => {
  console.log(`Order Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
