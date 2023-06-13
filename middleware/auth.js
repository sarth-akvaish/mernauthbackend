import jwt from "jsonwebtoken";
// import ENV from '../config.js';
import otenv from 'dotenv'
otenv.config();

export default async function Auth(req, res, next) {
    try {

        //access authorized header to validate request
        const token = req.headers.authorization.split(" ")[1];

        // retrieve the user details for the logged in user
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
        // console.log(decodedToken);
        req.user = decodedToken;
        next()
    } catch (error) {
        res.status(401).json({ error: "Authentication failed!!" })
    }
}

export function localVariables(req, res, next) {
    req.app.locals = {
        OTP: null,
        resetSession: false
    }
    next()
}