import mongoose from "mongoose";

const blackListedTokensSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
        unique: true
    },
    expirationDate: {
        type: Date,
        required: true,
    }
});

const BlackListedTokens = mongoose.model("BlackListedTokens", blackListedTokensSchema);

export default BlackListedTokens;