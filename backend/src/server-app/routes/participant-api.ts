import { Router } from "express";
import { handleInputErrors } from "../middleware/validation.js";
import { createHandler } from "../utils/createHandler.js";
import { ParticipantControllers } from "../controllers/ParticipantControllers.js";
import { body } from "express-validator";
import { authorize } from "../middleware/authorize.js";
import { UserRole } from "../database/schemas/UserRole.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/* /api/participant */

router.get(
  "/participants/:locationId",
  handleInputErrors,
  createHandler(ParticipantControllers, "getParticipantsByLocationId"),
);
router.post(
  "/create/:locationId",
  body("firstName").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("lastName").trim().notEmpty().withMessage("El apellido es obligatorio"),
  body("email").trim().isEmail().withMessage("El email no es válido"),
  body("documentNumber").optional().trim(),
  body("phone").optional().trim(),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("La fecha de nacimiento no es válida"),
    authenticate,
    authorize(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT),
  handleInputErrors,
  createHandler(ParticipantControllers, "createParticipant"),
);
export default router;
