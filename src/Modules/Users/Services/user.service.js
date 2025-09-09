import mongoose from "mongoose";
import User from "../../../DB/Models/user.model.js"
import Messages from "../../../DB/Models/message.model.js";
import { encrypt, decrypt } from "../../../Utils/encryption.utils.js";
import { compareSync, hashSync } from "bcrypt";
import { eventEmitter, sendEmail } from "../../../Utils/send-email.utils.js";
import { customAlphabet } from "nanoid";
import { v4 as uuidv4 } from 'uuid';
import { generateAccessToken, verifyAccessToken } from "../../../Utils/tokens.utils.js";
import BlackListedTokens from "../../../DB/Models/black-listed-tokens.model.js";

const uniqueString = customAlphabet('12334456', 5);

export const SignUpService = async (req, res, next) => {
    const { firstName, lastName, age, gender, email, password, phoneNumber, role } = req.body;
    const isUserExist = await User.findOne({ $or: [{ email }, { firstName, lastName }] });
    if (isUserExist) {
        return next(new Error("User already exists", { cause: 404 }));
    }

    // encrypt phone number
    const encryptedPhoneNumber = encrypt(phoneNumber);

    // hashing password
    const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);

    const otp = uniqueString();

    //const user = await User.create({firstName,lastName,age,gender,email,password});
    const userInstance = new User({
        firstName,
        lastName,
        age,
        gender,
        email,
        role,
        password: hashedPassword,
        phoneNumber: encryptedPhoneNumber,
        otps: [{ confirmationCode: hashSync(otp, +process.env.SALT_ROUNDS) }]
    });
    await userInstance.save();


    // Send email for registerd user
    await sendEmail({
        to: email,
        subject: "Welcome to Sarahah",
        content: `Your OTP is ${otp}`,
    })

    eventEmitter.emit("sendEmail", {
        to: email,
        subject: "Welcome to Sarahah",
        content: `Your OTP is ${otp}`,
    })

    return res.status(201).json({ message: "User created successfully", userInstance });
}

export const confirmEmailService = async (req, res, next) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, isConfirmed: false });
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    const isOtpValid = compareSync(otp, user.otps[0].confirmationCode);
    if (!isOtpValid) {
        return next(new Error("Invalid OTP", { cause: 400 }));
    }
    user.isConfirmed = true;
    user.otps[0].confirmationCode = undefined;
    await user.save();
    return res.status(200).json({ message: "User confirmed successfully", user });
}

export const SignInService = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    const isPasswordValid = compareSync(password, user.password);
    if (!isPasswordValid) {
        return next(new Error("Invalid email or password", { cause: 400 }));
    }

    // Generate token
    const accessToken = generateAccessToken(
        { id: user._id, email: user.email },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: uuidv4()
        });

    // Generate token
    const refreshToken = generateAccessToken(
        { id: user._id, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
            jwtid: uuidv4()
        });

    return res.status(200).json({ message: "User signed in successfully", accessToken, refreshToken });
}

export const updateUserService = async (req, res, next) => {

    console.log(req.loggedInUser);
    //const { _id } = req.loggedInUser;
    const { _id } = req.loggedInUser.user;

    const { firstName, lastName, age, gender, email, phoneNumber } = req.body;

    const user = await User.findByIdAndUpdate(_id,
        { firstName, lastName, age, gender, email, phoneNumber }, { new: true });
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    return res.status(200).json({ message: "User updated successfully" });

}

export const deleteUserService = async (req, res, next) => {
    // start session
    const session = await mongoose.startSession();

    // start transaction
    session.startTransaction();

    const { _id } = req.loggedInUser.user;
    console.log("Deleting user:", req.loggedInUser);

    const user = await User.findByIdAndDelete(_id, { session });
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    await Messages.deleteMany({ receiverId: _id }, { session });

    // commit transaction
    await session.commitTransaction();
    console.log("The Transaction has been committed");
    // end session
    session.endSession();

    return res.status(200).json({ message: "User deleted successfully", user });

}

export const listUsersService = async (req, res) => {

    let users = await User.find().populate("Messages");
    // users = users.map(user => {
    //     return {
    //         ...user._doc,
    //         phoneNumber: decrypt(user.phoneNumber)
    //     }
    // })
    return res.status(200).json({ message: "Users fetched successfully", users });
}

export const logoutUserService = async (req, res) => {
    const { token: { tokenId, expirationDate }, user: { _id } } = req.loggedInUser;


    const blackListedToken = await BlackListedTokens.create({
        tokenId,
        expirationDate: new Date(expirationDate * 1000),
        userId: _id
    });
    await blackListedToken.save();
    return res.status(200).json({ message: "User logged out successfully" });
}

export const refreshTokenService = async (req, res) => {
    const { refreshtoken } = req.headers;
    const { _id } = req.loggedInUser.user;

    const decodedToken = verifyAccessToken(refreshtoken, process.env.JWT_REFRESH_SECRET);

    const accessToken = generateAccessToken(
        { id: decodedToken.id, email: decodedToken.email },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
            jwtid: uuidv4()
        });

    return res.status(200).json({ message: "User token refreshed successfully", accessToken });

}



// forget password
export const forgetPasswordService = async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    const otp = uniqueString();
    const otpExpire = Date.now(Date.now() + 60 * 60 * 1000);
    user.otps[0].resetPasswordCode = hashSync(otp, +process.env.SALT_ROUNDS);
    user.otps[0].resetPasswordExpire = otpExpire;
    await user.save();
    await sendEmail({
        to: email,
        subject: "Reset Password",
        content: `Your OTP is ${otp}`,
    })
    return res.status(200).json({ message: "Reset password email has been sent to your email" });
}
// reset password 

export const resetPasswordService = async (req, res, next) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    const isOtpValid = compareSync(otp, user.otps[0].resetPasswordCode);
    if (!isOtpValid) {
        return next(new Error("Invalid OTP", { cause: 400 }));
    }

    if (user.otps[0].resetPasswordExpire < Date.now()) {
        return next(new Error("OTP has expired", { cause: 400 }));
    }

    const isOtpMatched = compareSync(otp, user.otps[0].resetPasswordCode);
    if (!isOtpMatched) {
        return next(new Error("OTP does not match", { cause: 400 }));
    }

    const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
    const isPasswordValid = compareSync(newPassword, user.password);
    if (isPasswordValid) {
        return next(new Error("New password cannot be the same as the old password", { cause: 400 }));
    }
    user.password = hashedPassword;
    user.otps[0].resetPasswordCode = undefined;
    user.otps[0].resetPasswordExpire = undefined;
    await user.save();


    return res.status(200).json({ message: "Password reset successfully" });

}
// update password
export const updatePasswordService = async (req, res, next) => {

    const { user: { _id: userId } } = req.loggedInUser;
    console.log(userId);

    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    if (!user.password) {
        return next(new Error("User has no password set", { cause: 400 }));
      }
      if (!oldPassword || !newPassword) {
        return next(new Error("Password data missing", { cause: 400 }));
      }
    const isPasswordValid = compareSync(oldPassword, user.password);
    if (!isPasswordValid) {
        return next(new Error("Invalid password", { cause: 400 }));
    }

    const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: "Password updated successfully" });
}
