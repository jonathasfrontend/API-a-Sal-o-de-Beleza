import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ZodSchema } from 'zod';
import { AppError } from './error.handler';

export const validateJoi = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return next(new AppError(errorMessages.join(', '), 400));
    }

    req.body = value;
    next();
  };
};

export const validateZod = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Check if the schema has a 'body' property by inspecting its shape
      const schemaShape = (schema as any)._def?.shape?.();
      const hasBodyProperty = schemaShape && 'body' in schemaShape;
      
      let validated;
      
      if (hasBodyProperty) {
        // Schema expects { body, query, params } structure
        validated = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        // Update request with validated data
        if (validated.body) req.body = validated.body;
        if (validated.query) req.query = validated.query;
        if (validated.params) req.params = validated.params;
      } else {
        // Schema expects direct body validation
        validated = schema.parse(req.body);
        req.body = validated;
      }
      
      next();
    } catch (error: any) {
      const errorMessages = error.errors?.map((err: any) => 
        `${err.path.join('.')}: ${err.message}`
      );
      return next(new AppError(errorMessages?.join(', ') || 'Validation error', 400));
    }
  };
};
