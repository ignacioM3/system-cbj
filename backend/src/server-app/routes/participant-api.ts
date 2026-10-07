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

router.put(
  "/edit/:participantId",
  body().custom((body) => {
    if (Object.keys(body).length === 0) {
      throw new Error("Debe enviar al menos un campo");
    }

    return true;
  }),
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío"),

  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El apellido no puede estar vacío"),

  body("documentNumber").optional().trim(),

  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("El email no es válido"),

  body("phone").optional({ values: "falsy" }).trim(),

  body("birthDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("La fecha de nacimiento no es válida"),

  authenticate,

  authorize(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT),

  handleInputErrors,

  createHandler(ParticipantControllers, "editParticipant"),
);

export default router;
