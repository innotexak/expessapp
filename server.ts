import dotenv from "dotenv";
import express from 'express';
import db from './src/config/database.js';
import cors from "cors";
import packageJson from "./package.json" assert { type: "json" };
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { MONGO_URL, PORT } from "./src/config/config.js";
import router from "./src/routes/route.js";
import { ErrorFormater } from "./src/helpers/formater.js";
import path from "path";
import { fileURLToPath } from "url";



dotenv.config()
new db(console).connect(MONGO_URL as string);
const app = express();

const entryFileDir = path.dirname(new URL(import.meta.url).pathname);
const viewsPath = path.join(entryFileDir, 'src', 'views');

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the path to the views directory
app.set('views', viewsPath);


const corsOptions = {
    origin: [
        "http://localhost:9000",
        "http://localhost:3000",
    ],
    credentials: true,
};
app.use(cors<cors.CorsRequest>(corsOptions));
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send({ name: packageJson.name, version: packageJson.version });
});

app.use('/ayo/api/v1/', bodyParser.json({ limit: "5mb" }), router)

app.use(ErrorFormater)





app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});

export { app }