import dotenv from "dotenv";
import mongoose from "mongoose";


dotenv.config();

const options = {
    serverSelectionTimeoutMS: 30000, // Defaults to 30000 (30 seconds)
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

class db {
    private readonly log: any;
    constructor(log: any) {
        this.log = log;
    }

    public connect(DB_URL: string) {
        const log = this.log;
        mongoose.set("strictQuery", false);
        mongoose
            .connect(DB_URL, options)
            .then(async () => {
                console.log(`Successfully connected to `, DB_URL);

            })
            .catch((err: any) => {
                console.log(`There was a db connection error`, err);
                process.exit(0);
            });
        mongoose.connection.once("disconnected", () => {
            console.log(`Successfully disconnected from ${DB_URL}`);
        });
        process.on("SIGINT", () => {
            mongoose.connection.close().then(() => {
                console.log("Database connection closed due to app termination");
                process.exit(0);
            });
        });
    }
}

export default db;
