const mongoose = require("mongoose")
const joi = require("joi")      //joi pour la validation
const jwt = require("jsonwebtoken")

//User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true, //supprime les vide au début et à la fin du string
        minlength:2,
    },
    email: {
        type: String,
        required: true,
        trim: true, //supprime les vide au début et à la fin du string
        minlength:5,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true, //supprime les vide au début et à la fin du string
        minlength:8,
    },
    profilePhoto: {
        type: Object,
        default:{
            url:"https://cdn.pixabay.com/photo/2017/02/25/22/04/user-icon-2098873_1280.png",
            publicId: null,
        }
    },
    bio:{  //On peut la trouver sous la forme bio:String
        type:String,
    },
    isAdmin:{     
        type:Boolean,
        default: false,
    },
    isAccountVerified:{    
        type:Boolean,
        default: false,
    },
}, {
    timestamps: true, //ajoute les champs createdAt et updatedAt
})

//Generate Auth Token
UserSchema.methods.generateAuthToken = function() {
    return jwt.sign({ id:this._id, isAdmin:this.isAdmin}, process.env.JWT_SECRET)  //"this" représente un object de la classe 
}

//User Model
const User = mongoose.model("User", UserSchema)

//Validate Register User
function validateRegisterUser(obj){
    const schema = joi.object({
        username: joi.string().trim().min(2).required(),
        email: joi.string().trim().min(5).email().required().email(),
        password: joi.string().trim().min(8).required(),
    })
    return schema.validate(obj)
}

//Validate Login User
function validateLoginUser(obj){
    const schema = joi.object({
        email: joi.string().trim().min(5).email().required().email(),
        password: joi.string().trim().min(8).required(),
    })
    return schema.validate(obj)
}

//Validate Update User
function validateUpdateUser(obj){
    const schema = joi.object({
        username: joi.string().trim().min(5).email(),
        password: joi.string().trim().min(8),
        bio: joi.string(),
    })
    return schema.validate(obj)
}



module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser
}