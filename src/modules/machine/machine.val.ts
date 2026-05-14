import Joi from "joi";

const machineNamePattern = /^Machine\d+$/;

export const createMachineSchema = Joi.object({
    branch_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'branch_id must be a number',
            'number.integer': 'branch_id must be an integer',
            'number.positive': 'branch_id must be a positive number',
            'any.required': 'branch_id is required'
        }),

    name: Joi.string()
        .trim()
        .pattern(machineNamePattern)
        .max(50)
        .required()
        .messages({
            'string.base': 'name must be a string',
            'string.empty': 'name is required',
            'string.pattern.base': 'name must be in format like Machine1, Machine2, Machine10',
            'string.max': 'name must not exceed 50 characters',
            'any.required': 'name is required'
        }),

    capacity_kg: Joi.number()
        .integer()
        .valid(3, 5, 7)
        .required()
        .messages({
            'number.base': 'capacity_kg must be a number',
            'number.integer': 'capacity_kg must be an integer',
            'any.only': 'capacity_kg must be one of 3, 5, or 7',
            'any.required': 'capacity_kg is required'
        })
});

export const updateMachineSchema = Joi.object({
    branch_id: Joi.number()
        .integer()
        .positive()
        .messages({
            'number.base': 'branch_id must be a number',
            'number.integer': 'branch_id must be an integer',
            'number.positive': 'branch_id must be a positive number'
        }),

    name: Joi.string()
        .trim()
        .pattern(machineNamePattern)
        .max(50)
        .messages({
            'string.base': 'name must be a string',
            'string.empty': 'name cannot be empty',
            'string.pattern.base': 'name must be in format like Machine1, Machine2, Machine10',
            'string.max': 'name must not exceed 50 characters'
        })
})
    .min(1)
    .messages({
        'object.min': 'at least one field is required for update'
    });

export const machineIdParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'id must be a number',
            'number.integer': 'id must be an integer',
            'number.positive': 'id must be a positive number',
            'any.required': 'id is required'
        })
});

export const branchIdParamSchema = Joi.object({
    branch_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'branch_id must be a number',
            'number.integer': 'branch_id must be an integer',
            'number.positive': 'branch_id must be a positive number',
            'any.required': 'branch_id is required'
        })
});
