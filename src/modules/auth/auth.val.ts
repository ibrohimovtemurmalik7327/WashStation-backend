import Joi from "joi";

const phoneRegex = /^\+[0-9]{9,15}$/;
const usernameRegex = /^[a-zA-Z0-9_]+$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/;
const otpCodeRegex = /^[0-9]{6}$/;

export const phoneField = Joi.string()
    .trim()
    .pattern(phoneRegex)
    .required()
    .messages({
        'string.empty': 'phone is required',
        'string.pattern.base': 'phone must be in +998901234567 format',
        'any.required': 'phone is required'
    });

export const usernameField = Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(usernameRegex)
    .required()
    .messages({
        'string.empty': 'username is required',
        'string.min': 'username must be at least 3 characters',
        'string.max': 'username must be at most 30 characters',
        'string.pattern.base': 'username may contain only letters, numbers, and underscore',
        'any.required': 'username is required'
    });

export const passwordField = Joi.string()
    .min(8)
    .max(100)
    .pattern(strongPasswordRegex)
    .required()
    .messages({
        'string.empty': 'password is required',
        'string.min': 'password must be at least 8 characters',
        'string.max': 'password must be at most 100 characters',
        'string.pattern.base': 'password must include uppercase, lowercase, number, and special character',
        'any.required': 'password is required'
    });

export const ticketIdField = Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
        'number.base': 'ticket_id must be a number',
        'number.integer': 'ticket_id must be an integer',
        'number.positive': 'ticket_id must be a positive number',
        'any.required': 'ticket_id is required'
    });

export const otpCodeField = Joi.string()
    .trim()
    .pattern(otpCodeRegex)
    .required()
    .messages({
        'string.empty': 'code is required',
        'string.pattern.base': 'code must be a 6-digit number',
        'any.required': 'code is required'
    });

export const registerStartSchema = Joi.object({
    username: usernameField,
    phone: phoneField,
    password: passwordField
}).required();

export const registerVerifySchema = Joi.object({
    ticket_id: ticketIdField,
    code: otpCodeField
}).required();

export const loginSchema = Joi.object({
    phone: phoneField,
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'password is required',
            'any.required': 'password is required'
        })
}).required();

export const changePasswordSchema = Joi.object({
    old_password: Joi.string()
        .required()
        .messages({
            'string.empty': 'old_password is required',
            'any.required': 'old_password is required'
        }),

    new_password: Joi.string()
        .min(8)
        .max(100)
        .pattern(strongPasswordRegex)
        .invalid(Joi.ref('old_password'))
        .required()
        .messages({
            'string.empty': 'new_password is required',
            'string.min': 'new_password must be at least 8 characters',
            'string.max': 'new_password must be at most 100 characters',
            'string.pattern.base': 'new_password must include uppercase, lowercase, number, and special character',
            'any.invalid': 'new_password must be different from old_password',
            'any.required': 'new_password is required'
        })
}).required();

export const forgotPasswordStartSchema = Joi.object({
    phone: phoneField
}).required();

export const forgotPasswordVerifySchema = Joi.object({
    ticket_id: ticketIdField,
    code: otpCodeField,
    new_password: Joi.string()
        .min(8)
        .max(100)
        .pattern(strongPasswordRegex)
        .required()
        .messages({
            'string.empty': 'new_password is required',
            'string.min': 'new_password must be at least 8 characters',
            'string.max': 'new_password must be at most 100 characters',
            'string.pattern.base': 'new_password must include uppercase, lowercase, number, and special character',
            'any.required': 'new_password is required'
        })
}).required();