import nodemailer from 'nodemailer'
import Mailgen from 'mailgen'

// import ENV from '../config.js'
import otenv from 'dotenv'
otenv.config();
// hhtps://ethereal.email/create 

let nodeConfig = {

    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password

    }
}

let transporter = nodemailer.createTransport(nodeConfig);


let mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Mailgen",
        link: "https://mailgen.js/"
    }
})


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


    var emailBody = mailGenerator.generate(email)

    let message = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: subject || "SignUp successfull",
        html: emailBody
    }

    transporter.sendMail(message)
    .then(()=>{
        return res.status(200).send({msg : "You should receive an email from us. "})
    })
    .catch(error => res.status(500).send({error}))
     
}