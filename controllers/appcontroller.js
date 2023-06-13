import UserModel from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ENV from '../config.js';
import otpGenerator from 'otp-generator'


// middleware to verify the user 
export async function verifyUser(req, res, next) {
    try {
        const { username } = req.method == 'GET' ? req.query : req.body;

        //check the user existance
        const exist = await UserModel.findOne({ username });
        if (!exist) return res.status(404).send({ msg: "Can't find User!" })
        next();
    } catch (error) {
        return res.status(404).send({ msg: "Authentication Error" })
    }
}

/* POST : http://localhost:8080/api/register
    @param :{
        "username":"jdbfsjfnb",
        "password": "safjhadsfjka",
        "email":"jksehfjksa@gmail.com",
        "firstName":"dsjjkfsa",
        "lastName":"najdfnan",
        "mobile":"982w73452875",
        "address":"nejfhaefal",
        "profile":""
    }
*/
export async function register(req, res) {
    try {
        const { username, password, email, profile } = req.body;

        //check the user existing user 
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username }, function (err, user) {
                if (err) reject(new Error(err))
                if (user) reject({ error: "Please use unique username" });
                resolve();
            })
        });


        //check for existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email }, function (err, email) {
                if (err) reject(new Error(err))
                if (email) reject({ error: "Please use unique email" })
                resolve();
            })
        });


        Promise.all([existUsername, existEmail])
            .then(() => {
                if (password) {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                profile: profile || '',
                                email
                            });

                            // return save result as a response
                            user.save()
                                .then(result => res.status(201).send({ msg: "User Register Successfully" }))
                                .catch(e => res.status(500).send({ e }));
                        }).catch(error => {
                            return res.status(500).send({
                                error: "Enable to Hashed Password "
                            })
                        })
                }
            }).catch((e) => {
                return res.status(500).send({ e: "Unable to hash Password!!!!" })
            })
    } catch (error) {
        return res.status(500).send(error);
    }
}

/* GET : http://localhost:8080/api/login
    @param :{
        "username":"jdbfsjfnb",
        "password": "safjhadsfjka"
*/
export async function login(req, res) {

    const { username, password } = req.body;
    try {
        UserModel.findOne({ username })
            .then(user => {
                // return res.status(201).send({ user });
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {
                        console.log(passwordCheck);
                        if (!passwordCheck) return res.status(400).send({ error: "Don't have password" })

                        //Create JWT token
                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, ENV.JWT_SECRET, { expiresIn: "24h" });
                        return res.status(200).send({
                            msg: "Login Successfull",
                            username: user.username,
                            token
                        });
                    })
                    .catch(error => {
                        return res.status(400).send({ error: "Password does not match" })
                    })
            })
            .catch(error => {
                return res.status(401).send({ error: "User not found" })
            })
    } catch (error) {
        return res.status(500).send({ error });
    }
}


/* GET : http://localhost:8080/api/user/user123  */
export async function getUser(req, res) {

    const { username } = req.params;

    try {
        if (!username) return res.status(500).send({ error: "Invalid Username" });

        UserModel.findOne({ username }, function (err, user) {
            if (err) return res.status(500).send({ err });
            if (!user) return res.status(501).send({ error: "Couldn't find the User" });

            const { password, ...rest } = Object.assign({}, user.toJSON());
            return res.status(201).send(user);
        })
    } catch (error) {
        return res.status(404).send({ error: "Cannot find user data" });
    }

}


/* PUT : http://localhost:8080/api/updateUser 
  @param :{
    "id":"<userid>"
  }
  body : {
    firstName : '',
    address:'',
    profile: '',
  }

*/
export async function updateUser(req, res) {
    try {
        // const id = req.query.id;
        const { userId } = req.user;
        if (userId) {

            const body = req.body;

            //update data
            UserModel.updateOne({ _id: userId }, body, function (err, data) {
                if (err) throw err;

                return res.status(201).send({ msg: "Record Updated!" })
            })
        } else {
            res.status(401).send({ error: "User not Found!" });
        }
    } catch (error) {
        return res.status(401).send({ error: "Error occured in updateuser!!" });
    }
}

/* GET : http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    res.status(201).send({ code: req.app.locals.OTP });
}

/* GET : http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null;    //reset the OTP value
        req.app.locals.resetSession = true;   // start the session for the password resseting
        return res.status(201).send({ msg: "Verify Successfull" });
    }
    return res.status(400).send({ error: "Invalid OTP" });
}


//successfully redirect the user when OTP is valid
/* POST : http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res) {
    // res.json('createResetSession route');


    if (req.app.locals.resetSession) {

        return res.status(201).send({ flag: req.app.locals.resetSession });

    }

    return res.status(440).send({ error : "Session expired!" });
}


/* PUT : http://localhost:8080/api/resetpassword */
export async function resetpassword(req, res) {
    try {
        if (!req.app.locals.resetSession)
            return res.status(440).send({ msg: "Session expired!" });

        const { username, password } = req.body;

        try {
            UserModel.findOne({ username })
                .then(user => {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {
                            UserModel.updateOne({ username: user.username },
                                { password: hashedPassword }, function (err, data) {
                                    if (err) throw err;
                                    req.app.locals.resetSession = false;
                                    return res.status(201).send({ msg: "Record Updated" });
                                });
                        })
                        .catch(e => {
                            return res.status(500).send({ error: "Unable to hash Password!" });
                        })
                })
                .catch(error => {
                    return res.status(404).send({ error: "Username not found!" });
                })
        } catch (error) {
            res.status(500).send({ error });
        }
    } catch (error) {
        res.status(401).send({ error });
    }
}


export const registerMail = async (req, res) => {
    const { username, userEmail, text, subject } = req.body;


    //body  of the email
    var email = {
        body: {
            name: username,
            intro: text || " Welcome to my first MERN project",
            outro: "Need help to tackle the MERN project related problems"
        }
    }


}