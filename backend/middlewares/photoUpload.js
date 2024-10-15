const path = require("path");
const multer = require("multer");       //! multer upload photos in nodejs


//Photo Storage
const photoStorage = multer.diskStorage({
    destination: function (req,file,cb) {  //cb: call back
        cb(null, path.join(__dirname,"../images"));        //null: on n'a pas un msg d'erreur
    }, 
    filename: function(req,file,cb){
        if (file) {
            cb(null,  new Date().toISOString().replace(/:/g,"-")+ file.originalname);    //"file.originalname" le nom vient de lapart du client
        } else{
            cb(null, false)
        }
    }


});


//Photo Upload Middleware
const photoUpload = multer({
    storage: photoStorage,
    
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {        //On peut préciser le type de l'image en ajoutant "image/jpg ou bien image/png"
            cb(null, true)
        } else{
            cb({message:"Unsupported file format"}, false)
        }
    },
    limits: { fileSize: 1024 * 1024 },  //1024 * 1024 = 1 megabyte  / 1024 * 1024 * 2 = 2 megabyte

})


module.exports = photoUpload;








