/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import cors from 'cors';
import proxy from 'express-http-proxy';
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import axios from 'axios';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as path from 'path';
import initializeSiteConfig from './libs/initializeSiteConfig';

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
  })
);

app.use(morgan('dev'));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(cookieParser());
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 6+0 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many Requests, please try again later"},
  standardHeaders: true,
  legacyHeaders: true,    
  keyGenerator: (req: any) => req.ip,
});

app.use(limiter);

app.get('/getway-health', (req, res) => {
  res.send({ message: 'Welcome to api-getway!' });
});

app.use(
  "/order",
  proxy("http://localhost:6004", {
    proxyReqPathResolver: (req) => {
      return `/order${req.url}`;
    }
  })
);
app.use("/product", proxy("http://localhost:6002"))
app.use("/", proxy("http://localhost:6001"));



const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Site Config Initialzed successfully!")
  } catch (error) {
    console.log("Failed to initialze site config: ", error)
  }
});
server.on('error', console.error);
