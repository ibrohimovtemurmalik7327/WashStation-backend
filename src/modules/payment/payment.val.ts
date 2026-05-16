import Joi from "joi";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createPaymentSchema = Joi.object({
    branch_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base':     'branch_id must be a number',
            'number.integer':  'branch_id must be an integer',
            'number.positive': 'branch_id must be a positive number',
            'any.required':    'branch_id is required'
        }),

    date: Joi.string()
        .pattern(dateRegex)
        .custom((value, helpers) => {
            const today = new Date().toISOString().split('T')[0];
            if (value < today) return helpers.error('date.past');
            return value;
        })
        .required()
        .messages({
            'string.base':         'date must be a string',
            'string.empty':        'date is required',
            'string.pattern.base': 'date must be in YYYY-MM-DD format',
            'date.past':           'date cannot be in the past',
            'any.required':        'date is required'
        }),

    start_time: Joi.string()
        .pattern(timeRegex)
        .required()
        .messages({
            'string.base':         'start_time must be a string',
            'string.empty':        'start_time is required',
            'string.pattern.base': 'start_time must be in HH:MM format',
            'any.required':        'start_time is required'
        }),

    total_kg: Joi.number()
        .integer()
        .positive()
        .min(1)
        .max(100)
        .required()
        .messages({
            'number.base':     'total_kg must be a number',
            'number.integer':  'total_kg must be an integer',
            'number.positive': 'total_kg must be a positive number',
            'number.min':      'total_kg must be at least 1',
            'number.max':      'total_kg must be at most 100',
            'any.required':    'total_kg is required'
        }),
});