const asyncHandler = require("express-async-handler")           //express-async-handler empéche l'utilisation du trycatch
const bcrypt = require("bcryptjs")
const { User, validateRegisterUser, validateLoginUser } = require("../models/User")


/**---------------------------------------
 * @desc Register New User //Sign Up
 * @route /api/auth/register
 * @method POST
 * @access public
-----------------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req,res) =>{
    
    //  Validation
    const {error} = validateRegisterUser(req.body)
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }

    //  Is User already exist
    let user = await User.findOne({email:req.body.email})
    if(user){
        return res.status(400).json({message: "Email already exist 😐"})
    }

    //  Hash the PW
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    //  New User and save it to DB
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
    })
    await user.save()

        //! @TODO - ENDING EMAIL (verify account)

    //  Send response to client
    res.status(201).json({message:"You registered successfully, please login"})
})


/**---------------------------------------
 * @desc Login User 
 * @route /api/auth/login
 * @method POST
 * @access public
-----------------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req,res) =>{
    //  Validation
    const {error} = validateLoginUser(req.body)
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }

    //  Is User EXist
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return res.status(400).json({message: "Email not found ⛔"})
    }

    //  Check PW
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password)
    if(!isPasswordMatch){
        return res.status(400).json({message: "Password not found 🫣"})
    }

    //! @TODO - ENDING EMAIL (verify account if not verified)

    //  Generate token (jwt)
    const token = user.generateAuthToken();

    //  response to client
    res.status(200).json({
        _id: user._id,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
        token
    })

})