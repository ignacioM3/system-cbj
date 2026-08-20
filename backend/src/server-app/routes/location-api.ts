import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { UserRole } from "../database/schemas/UserRole.js";
import { authorize } from "../middleware/authorize.js";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation.js";
import { createHandler } from "../utils/createHandler.js";
import { LocationControllers } from "../controllers/LocationControllers.js";

const router = Router();

/* /api/location */

router.post(
  "/create",
  authenticate,
  authorize(UserRole.ADMIN),
  body("name")
    .isString()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío"),
  body("address")
    .isString()
    .notEmpty()
    .withMessage("La dirección no puede estar vacío"),
  handleInputErrors,
  createHandler(LocationControllers, "createLocation"),
);

router.get(
  "/locations/active",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COORDINATOR),
  handleInputErrors,
  createHandler(LocationControllers, "getAllLocationsActive"),
);

export default router;
