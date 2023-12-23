import { Document, Model } from "mongoose";
import MongooseErrorUtils from "../helpers/mongoDbError.js";


class GeneralService {

    async handleMongoError(mongo: Promise<Document>): Promise<Document> {
        return mongo.catch(reason => {
            throw MongooseErrorUtils.handleMongooseError(reason);
        });
    }

}

export default GeneralService