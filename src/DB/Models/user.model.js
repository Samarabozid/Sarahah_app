import mongoose from "mongoose";
import { genderEnum, roleEnum } from "../../Common/enums/user.enum.js";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: [3, "First name must be at least 3 characters long"],
        maxlength: [50, "First name must be at most 50 characters long"]
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minlength: [3, "Last name must be at least 3 characters long"],
        maxlength: [50, "Last name must be at most 50 characters long"]
    },
    age: {
        type: Number,
        required: true,
        min: [18, "Age must be at least 18"],
        max: [120, "Age must be at most 120"],
        index: {
            name: "idx_age"
        }
    },
    gender: {
        type: String,
        required: true,
        enum: Object.values(genderEnum),
        default: genderEnum.MALE
    },
    phoneNumber: {
        type: String,
        required: true
    },
    otps: [{
        confirmationCode: String,
        resetPasswordCode: String
    }],
    isConfirmed: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true,
            name: "idx_email"
        }
    }, password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required:true,
        enum: Object.values(roleEnum),
        default: roleEnum.USER
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    virtuals: {
        fullName: {
            get() {
                return `${this.firstName} ${this.lastName}`;
            }
        }
    },
    methods: {
        getFullName() {
            return `${this.firstName} ${this.lastName}`;
        },
        getDoubleAge() {
            return this.age * 2;
        }
    }
});


userSchema.virtual("Messages", {
    ref: "Messages",
    localField: "_id",
    foreignField: "receiverId"
})

const User = mongoose.model("User", userSchema);

export default User;
