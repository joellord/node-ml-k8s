import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const wwwPath = `${__dirname}/www`;

dotenv.config({path: __dirname + "/.env"});

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(`${wwwPath}/index.html`);
});

app.get("/config", (req, res) => {
  res.send({
    DB_SERVER: process.env.DB_SERVER
  }).status(200);
})

app.use(express.static(wwwPath));

app.listen(process.env.PORT, () => console.log(`Detector front end started on port ${process.env.PORT}`))