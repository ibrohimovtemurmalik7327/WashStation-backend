import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req[property] || {}, {
            abortEarly: true,
            stripUnknown: true
        });

        if (error) {
            res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                data: {
                    message: error.details?.[0]?.message || 'Validation error'
                }
            });
            return;
        }

        if (property === 'query') {
            Object.assign(req.query, value);
        } else {
            req[property] = value;
        }

        next();
    };
};