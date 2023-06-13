import mongoose from 'mongoose'

export const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        requried: [true, "Please provide the username"],
        unique: [true, "Alreasy taken"]
    },
    password: {
        type: String,
        requried: [true, "Please provide password"],
        unique: false
    },
    email: {
        type: String,
        requried: [true, "please provide unique email"],
        unique: true
    },
    firstName: String,
    lastName: String,
    mobile: Number,
    address: String,
    profile: String
})

export default mongoose.model("User", UserSchema);