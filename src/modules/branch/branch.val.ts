import Joi from "joi";

export const idParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
});

export const createBranchSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(3)
        .max(120)
        .required(),

    phone: Joi.string()
        .trim()
        .pattern(/^\+[0-9]+$/)
        .min(9)
        .max(30)
        .required(),

    address: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .required(),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional()
        .allow(null),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional()
        .allow(null)
});

export const updateBranchSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(3)
        .max(120)
        .optional(),

    phone: Joi.string()
        .trim()
        .pattern(/^\+[0-9]+$/)
        .min(9)
        .max(30)
        .optional(),

    address: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .optional(),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional()
        .allow(null),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional()
        .allow(null)
}).min(1);
