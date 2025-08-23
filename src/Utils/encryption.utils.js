import crypto from "node:crypto";

const IV_LENGTH = +process.env.IV_LENGTH;
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY);
export const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);

    let encryptedText = cipher.update(text, "utf8", "hex");

    encryptedText += cipher.final("hex");

    return `${iv.toString("hex")}:${encryptedText}`;
}

export const decrypt = (encryptedData) => {
    const [iv, encryptedText] = encryptedData.split(":");

    const binaryLikeIv = Buffer.from(iv, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, binaryLikeIv);

    let decryptedText = decipher.update(encryptedText, "hex", "utf8");
    
    decryptedText += decipher.final("utf8");
    
    return decryptedText;
}
