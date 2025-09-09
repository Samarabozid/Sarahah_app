import Joi from "joi";
import { genderEnum, roleEnum } from "../../Common/enums/user.enum.js";
export const signUpSchema = {
    body: Joi.object({
        firstName: Joi.string().alphanum().required().messages({
            "any.required": "First name is required",
            "string.base": "First name must be a string",
            "string.alphanum": "First name must be alphanumeric",
            "string.min": "First name must be at least 3 characters long",
            "string.max": "First name must be at most 50 characters long"
        }),
        lastName: Joi.string().min(3).max(20).required(),
        minAge: Joi.number().min(18).required(),
        maxAge: Joi.number().max(100).required(),
        age: Joi.number().min(Joi.ref('minAge')).max(Joi.ref('maxAge')).required(),
        //age: Joi.number().integer().positive().required(),
        gender: Joi.string().valid(...Object.values(genderEnum)).optional(),
        email: Joi.string().email({
            tlds: {
                allow: ['com', 'org'],
                deny: ['net', 'io', 'sa']
            },
            minDomainSegments: 2
            //multiple: true,
            //maxDomainSegments: 2,

        }).required(),
        role: Joi.string().valid(...Object.values(roleEnum)).required(),
        password: Joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/)
            .required().messages({
                "any.required": "Password is required",
                "string.base": "Password must be a string",
                "string.pattern": "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character",
                "string.min": "Password must be at least 8 characters long",
                "string.max": "Password must be at most 50 characters long"
            }),
        confirmPassword: Joi.string().valid(Joi.ref('password')),
        phoneNumber: Joi.string().required(),
        isConfirmed: Joi.boolean().truthy("yes").falsy("no").sensitive(true)
    })
}