// import jwt from "jsonwebtoken"
// import { secretKey } from "../controller/userController.js"


// export const verifyToken = async(req,resizeBy,next)=>{
//     const header =req.headers.authorization
//     console.log(header)

//     const token =header.split(" ")[1]

//     const isVerified = jwt.verify(token,secretKey)

//     if(!isVerified) {
//         return resizeBy.status(403).json({
//             message : "token invalid or expired"
//         })
//     }

//     next()
// }


import jwt from "jsonwebtoken";
import { secretKey } from "../controller/userController.js";

export const verifyToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing",
      });
    }

    const token = header.split(" ")[1];

    const isVerified = jwt.verify(token, secretKey);

    req.user = isVerified;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token invalid or expired",
    });
  }
};