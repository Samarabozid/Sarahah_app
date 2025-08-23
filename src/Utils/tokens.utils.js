import jwt from "jsonwebtoken";

// Generate token
export const generateAccessToken = (payload, secretKey, options) => {
    return jwt.sign(payload, secretKey, options);
}

// Verify token
export const verifyAccessToken = (token, secretKey) => {
    return jwt.verify(token, secretKey);
}