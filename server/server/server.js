import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { appConfig } from "./config/appConfig.js";
import { aiController } from "./controllers/aiController.js";

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// // CORS configuration
// app.use(
//   cors({
//     origin: appConfig.corsConfig.origin,
//     methods: appConfig.corsConfig.methods,
//     allowedHeaders: appConfig.corsConfig.allowedHeaders,
//   })
// );

const PORT = process.env.PORT || 8000;

// Handling preflight requests
app.options("/chat-with-gemini", (req, res) => {
  res.set({
    "Access-Control-Allow-Origin": appConfig.corsConfig.origin,
    "Access-Control-Allow-Methods": appConfig.corsConfig.methods.join(","),
    "Access-Control-Allow-Headers": appConfig.corsConfig.allowedHeaders.join(","),
  });
  res.sendStatus(200);
});

// Actual endpoint for POST request
app.post("/chat-with-gemini", aiController);

// App listening
app.listen(PORT, () => {
  console.log("Gemini AI Server is listening on port number", PORT);
});