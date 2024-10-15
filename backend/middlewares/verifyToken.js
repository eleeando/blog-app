const jwt = require("jsonwebtoken");



//Verify Token
function verifyToken(req, res, next){
    const authToken = req.headers.authorization;
    if(authToken) {
        const token = authToken.split(" ")[1];
        try {
            const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);  //Cette fonction permet de décoder le token et elle va nous donner le payload deja fixé dans le models "jwt.sign({ id:this._id, isAdmin:this.isAdmin}, process.env.JWT_SECRET)"
            req.user = decodedPayload;
            next();
        } catch (error) {
            return  res.status(401).json({ message: "Invalid Token ❌" });
        }
    } else{
        return res.status(401).json({message: "No Token Provided, access denied 🙅‍♀️"})
    }
}

//Verify Token And Admin
function verifyTokenAndAdmin(req,res,next){
    verifyToken(req,res, () => {
        if (req.user.isAdmin) {
            next()
        } else{
            return res.status(403).json({message:"Not Allowed, Only Admin 🚨"})
        }
    });
}

//Verify Token And Only User Himself
function verifyTokenAndOnlyUser(req,res,next){
    verifyToken(req,res, () => {
        if (req.user.id === req.params.id) {
            next()
        } else{
            return res.status(403).json({message:"Not Allowed, Only User Himself 🚨🚨"})
        }
    });
}



module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser
}