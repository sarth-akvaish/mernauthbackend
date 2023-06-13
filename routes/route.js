import { Router } from "express";

const router = Router();

// import all controllers 
import * as controller from '../controllers/appcontroller.js';
import Auth, { localVariables } from "../middleware/auth.js";
import { registerMail } from "../controllers/mailer.js";

// POST methods 
router.route('/register').post(controller.register);
router.route('/registerMail').post(registerMail);  //send the email
router.route('/authenticate').post(controller.verifyUser, (req, res) => res.end());  //authenticate user
router.route('/login').post(controller.verifyUser, controller.login);         // login in app

// Get methods 
router.route('/user/:username').get(controller.getUser);   // user with username
router.route('/generateOTP').get(controller.verifyUser, localVariables, controller.generateOTP);      //generate random OTP
router.route('/verifyOTP').get(controller.verifyUser,controller.verifyOTP);       //  verify generated OTP
router.route('/createResetSession').get(controller.createResetSession);

// Put Methods 
router.route('/updateuser').put(Auth, controller.updateUser);  // use to update the user profile 
router.route('/resetPassword').put(controller.verifyUser, controller.resetpassword);   //use to reset the password



export default router;