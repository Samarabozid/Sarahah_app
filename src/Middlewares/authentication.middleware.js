
import BlackListedTokens from "../DB/Models/black-listed-tokens.model.js";
import { verifyAccessToken } from "../Utils/tokens.utils.js";
import User from "../DB/Models/user.model.js";

export const authenticationMiddleware = async (req, res, next) => {
    const {authorization:accesstoken} = req.headers;
    if (!accesstoken) {
        return next(new Error("No token found, Please Login", {cause:401}));
    }

    // if(!accesstoken.startsWith(process.env.JWT_PREFIX)){
    //     return next(new Error("Invalid token", {cause:401}));
    // }

    const [prefix, token] = accesstoken.split(' ');
    if(prefix !== process.env.JWT_PREFIX){
        return next(new Error("Invalid token", {cause:401}));
    }

    const decodedToken = verifyAccessToken(token, process.env.JWT_ACCESS_SECRET);
    if (!decodedToken.jti) {
        return next(new Error("Invalid token", {cause:401}));
    }
    const blackListedToken = await BlackListedTokens.findOne({
        tokenId: decodedToken.jti,
    });
    if (blackListedToken) {
        return next(new Error("User already logged out, Please Login Again", {cause:404}));
    }

    //const user = await User.findById(decodedToken?._id, '-password').lean();
    const user = await User.findById(decodedToken?.id, '-password').lean();
 
    if (!user) { 
        return next(new Error("User not found", {cause:404}));
    }
    req.loggedInUser = {user, token:{tokenId:decodedToken.jti, expirationDate:decodedToken.exp}};
    //req.loggedInUser = {...user, tokenId:decodedToken.jti, expirationDate:decodedToken.exp};

    next();
}
