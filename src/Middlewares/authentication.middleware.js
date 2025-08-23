
import BlackListedTokens from "../DB/Models/black-listed-tokens.model.js";
import { verifyAccessToken } from "../Utils/tokens.utils.js";
import User from "../DB/Models/user.model.js";

export const authenticationMiddleware = async (req, res, next) => {
    const {accesstoken} = req.headers;
    if (!accesstoken) {
        return next(new Error("No token found, Please Login", {cause:401}));
    }

    if(!accesstoken.startsWith(process.env.JWT_PREFIX)){
        return next(new Error("Invalid token", {cause:401}));
    }

    const token = accesstoken.split(' ')[1];

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

    const user = await User.findById(decodedToken.id);
    if (!user) {
        return next(new Error("User not found", {cause:404}));
    }
    req.loggedInUser = user;

    next();
}
