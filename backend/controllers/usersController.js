const asyncHandler = require("express-async-handler")  
const {User, validateUpdateUser} = require("../models/User")
const bcrypt = require("bcryptjs")
const path = require("path")
const fs = require("fs");   //file setting
const {cloudinaryUploadImage, cloudinaryRemoveImage} = require("../utils/cloudinary")




/**---------------------------------------
 * @desc Get All Users Profile
 * @route /api/users/profile
 * @method GET
 * @access private (only admin)
-----------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req,res) => {
    // console.log(req.headers.authorization.split(" ")[1])  //la fonction split rend le bearer un array
    const users = await User.find().select("-password");
    res.status(200).json(users);
})

/**---------------------------------------
 * @desc Get User Profile
 * @route /api/users/profile/:id
 * @method GET
 * @access public
-----------------------------------------*/
module.exports.getUserProfileCtrl = asyncHandler(async (req,res) => {
    // console.log(req.headers.authorization.split(" ")[1])  //la fonction split rend le bearer un array
    const user = await User.findById(req.params.id).select("-password");
    if(!user){
        return res.status(400).json({message:"User Not Found 🚩"})
    }
    res.status(200).json(user);
})

/**---------------------------------------
 * @desc Update User Profile
 * @route /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
-----------------------------------------*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req,res) => {
    const {error} = validateUpdateUser(req.body);
    if (error) {
        return res.status(400).json({message: error.details[0].message})
    }

    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);   //"Salt" donne un fort chiffrage 
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
        $set: { //"$set" est le responsable de la mise à jour dans la DB
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio
        }
    },{new: true}).select("-password")

    res.status(200).json(updatedUser)
})

/**---------------------------------------
 * @desc Get Users Count
 * @route /api/users/count
 * @method GET
 * @access private (only admin)
-----------------------------------------*/
module.exports.getUsersCountCtrl = asyncHandler(async (req,res) => {
    const count = await User.countDocuments();  // La fonction "countDocuments()" donne que le nombre d'utilisateurs dans l'application
    res.status(200).json(count);
})

/**---------------------------------------
 * @desc Profile Photo Upload
 * @route /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (only login user)
-----------------------------------------*/
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req,res) => {
    console.log("the file is :" , req.file);
    //Validation
    if (!req.file) {
        return res.status(400).json({message:"No file provided 🔎"})
    }

    //Get the path to the image
    const imagePath = path.join(__dirname, `${req.file.destination}/${req.file.filename}`)
    // console.log("the image path : " , imagePath);

    //Upload to cloudinary
    const result = await cloudinaryUploadImage(`${req.file.destination}/${req.file.filename}`)
    console.log(result)

    //Get the user from DB
    const user= await User.findById(req.user.id);

    //Delete the old profile photo if exist
    if (user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId)
    }

    //Change the profile photo field in the DB
    user.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id,  // il est utilisable quand on supprime la photo
    }
    await user.save()   //Pour enregistrer les nouveaux changements

    //Send response to teh client
    //! console.log(req.file)
    res.status(200).json({
        message:"Your profile photo uploaded successfully 📸.",
        profilePhoto: {url: result.secure_url, publicId: result.public_id}
    })

    //Remove image from the server
    fs.unlinkSync(imagePath)    //Il permet de supprimer des fichier dans le nodejs

})