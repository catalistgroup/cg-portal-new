import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/routes";
import ErrorConfig from "./utils/ErrorConfig";
import catalogImportProcessor from "./cron/catalogImport_to_catalog_sync";

const app = express();

app.set("etag", false);

const allowedOrigins = process.env.CLIENT_URL?.split(",") ?? [
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "20mb" }));
app.use(morgan("dev"));

app.all("/health-check", (req, res) => {
  res.send("Ok");
});

app.use("/api", routes);

app.use(ErrorConfig.ErrorHandler);

const PORT = process.env.PORT || 5000;

// Initialize catalog import processor CRON JOB
catalogImportProcessor.init();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
