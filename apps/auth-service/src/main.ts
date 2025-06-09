import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/middleware';
import cookieParser from 'cookie-parser';
import router from './routes/auth.router';
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.use(
    cors({
        origin: ["http://localhost:3000"],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true
    })
);
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API' });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
})

// Routes
app.use("/api", router);
app.use(errorMiddleware);

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/api`);
    console.log(`Swagger Docs available at http://localhost:${port}/docs`)
})
server.on("error", (err) => {
    console.log("Server Error : ", err)
})