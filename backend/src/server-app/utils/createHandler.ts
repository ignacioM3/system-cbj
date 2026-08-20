import type { Request, Response, NextFunction } from 'express';
import { ServiceContainer } from "../services/ServicesContainer.js";
import { DatabaseService } from "../services/DatabaseService.js";

type ControllerConstructor<T> = new (db: DatabaseService) => T;

export const createHandler = <T>(
    ControllerClass: ControllerConstructor<T>,
    methodName: keyof T
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const container = ServiceContainer.getInstance();
            const db = container.getDatabaseService();
            const controller = new ControllerClass(db);

            const method = controller[methodName];
            if (typeof method !== 'function') {
                throw new Error(`Method ${String(methodName)} not found on controller`);
            }

            // Bind the method to the controller instance to preserve 'this' context
            return (method as Function).call(controller, req, res, next);
        } catch (error) {
            next(error);
        }
    };
};
