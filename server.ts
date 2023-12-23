import dotenv from "dotenv";
import express from 'express';
import db from './src/config/database.js';
import cors from "cors";
import packageJson from "./package.json" assert { type: "json" };
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_SECRET_KEY, MONGO_URL, PORT } from "./src/config/config.js";
import router from "./src/routes/route.js";
import { ErrorFormater } from "./src/helpers/formater.js";
import path from "path";
import session from 'express-session';
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';



dotenv.config()
new db(console).connect(MONGO_URL as string);
const app = express();

const entryFileDir = path.dirname(new URL(import.meta.url).pathname);
const viewsPath = path.join(entryFileDir, 'src', 'views');

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the path to the views directory
app.set('views', viewsPath);


app.use(
    session({
        secret: GOOGLE_SECRET_KEY as string,
        resave: false,
        saveUninitialized: true,
    })
);




// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

//Serialize
passport.serializeUser((user: any, done) => {
    done(null, user);
});

// Deserialize
passport.deserializeUser((obj: any, done) => {
    done(null, obj);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID as string,
            clientSecret: GOOGLE_SECRET_KEY as string,
            callbackURL: `${GOOGLE_CALLBACK_URL}/api/v1/auth/google/callback`,
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, { ...profile, accessToken, refreshToken });
        }
    )
);

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
app.use('/api/v1/', bodyParser.json({ limit: "5mb" }), router)
app.use(ErrorFormater)





app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});

