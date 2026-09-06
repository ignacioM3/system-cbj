import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { UserRole } from "../database/schemas/UserRole.js";
import { createHandler } from "../utils/createHandler.js";
import { UserControllers } from "../controllers/UserControllers.js";
import { handleInputErrors } from "../middleware/validation.js";
import { create } from "domain";

const router = Router();

// /users
router.post(
  "/create/coordinator",
  body("firstName").trim().notEmpty().withMessage("El nombre es obligatorio"),

  body("lastName").trim().notEmpty().withMessage("El apellido es obligatorio"),

  body("email").trim().isEmail().withMessage("El email no es válido"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres"),

  body("documentNumber").optional().trim(),

  body("phone").optional().trim(),

  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de nacimiento no es válida"),
  authenticate,
  authorize(UserRole.ADMIN),
  handleInputErrors,
  createHandler(UserControllers, "createUserCoordinator"),
);

router.get('/list-coordinator', authenticate, authorize("Admin"), handleInputErrors, createHandler(UserControllers, "getUserCoordinator"))
router.post('/disable/:userId', authenticate, authorize("Admin", "Coordinator"), handleInputErrors, createHandler(UserControllers, "disableUser"))
router.post('/delete/coordinator/:userId', authenticate, authorize("Admin"), handleInputErrors, createHandler(UserControllers, "deleteUser"))


export default router