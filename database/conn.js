import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
// import ENV from '../config.js'
import otenv from 'dotenv'
otenv.config();

async function connect() {
    const mongod = await MongoMemoryServer.create();
    const getUri = mongod.getUri();

    mongoose.set('strictQuery',true);
    // const db = mongoose.connect(getUri);
    const db = await mongoose.connect(process.env.ATLAS_URI);
    console.log("Database connected")
    return db;
}

export default connect;