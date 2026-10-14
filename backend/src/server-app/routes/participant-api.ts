import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { handleInputErrors } from "../middleware/validation.js";
import { createHandler } from "../utils/createHandler.js";
import { ParticipantControllers } from "../controllers/ParticipantControllers.js";
import { body, param, validationResult } from "express-validator";
import { authorize } from "../middleware/authorize.js";
import { UserRole } from "../database/schemas/UserRole.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const handleParticipantIdNotFound = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(404).json({ error: "Participante no encontrado" });
  }

  next();
};

/* /api/participant */

router.get("/participants/:locationId",
  handleInputErrors,
  createHandler(ParticipantControllers, "getParticipantsByLocationId"),
);
router.post("/create",
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

router.post("/toggle-status/:id",
  param("id").isUUID(),
  handleParticipantIdNotFound,
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT),
  handleInputErrors,
  createHandler(ParticipantControllers, "toggleParticipantStatus"),
);

router.put("/edit/:participantId",
  body().custom((requestBody) => {
    const editableFields = [
      "firstName",
      "lastName",
      "documentNumber",
      "birthDate",
      "email",
      "phone",
    ];
    const bodyFields = Object.keys(requestBody ?? {});
    const protectedFields = [
      "id",
      "created_at",
      "isActive",
      "locationId",
      "location",
      "role",
    ];
    const presentProtectedFields = bodyFields.filter((field) =>
      protectedFields.includes(field),
    );

    if (presentProtectedFields.length > 0) {
      throw new Error(
        `Campos no editables: ${presentProtectedFields.join(", ")}`,
      );
    }

    const definedEditableFields = editableFields.filter(
      (field) => requestBody?.[field] !== undefined,
    );

    if (definedEditableFields.length === 0) {
      throw new Error("No hay campos a actualizar");
    }

    const invalidFields = bodyFields.filter(
      (field) => !editableFields.includes(field),
    );
    if (invalidFields.length > 0) {
      throw new Error(`Campos no editables: ${invalidFields.join(", ")}`);
    }

    return true;
  }),
  body("firstName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío"),

  body("lastName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El apellido no puede estar vacío"),

  body("documentNumber")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El documento no puede estar vacío"),

  body("email")
    .optional({ values: "undefined" })
    .customSanitizer((value) =>
      value === null || value === ""
        ? null
        : typeof value === "string"
          ? value.trim().toLowerCase()
          : value,
    )
    .if((value) => value !== null)
    .isString()
    .bail()
    .isEmail()
    .withMessage("El email no es válido"),

  body("phone")
    .optional({ values: "undefined" })
    .customSanitizer((value) =>
      value === null || value === ""
        ? null
        : typeof value === "string"
          ? value.trim()
          : value,
    )
    .if((value) => value !== null)
    .isString()
    .bail()
    .matches(/^[0-9 +()\-]{6,20}$/)
    .withMessage("El teléfono no es válido"),

  body("birthDate")
    .optional({ values: "undefined" })
    .customSanitizer((value) => (value === null || value === "" ? null : value))
    .if((value) => value !== null)
    .isString()
    .bail()
    .isISO8601({ strict: true })
    .withMessage("La fecha de nacimiento no es válida"),

  authenticate,

  authorize(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT),

  handleInputErrors,

  createHandler(ParticipantControllers, "editParticipant"),
);

router.get("/list-participant/:locationId",
  authenticate,
  authorize("Admin", "Coordinator", "Equipment"),
  handleInputErrors,
  createHandler(ParticipantControllers, "getParticipantsPaginated"),
);

router.get("/details/:participantId",
  param("participantId").isUUID(),
  handleParticipantIdNotFound,
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT),
  handleInputErrors,
  createHandler(ParticipantControllers, "getParticipantById"),
);

export default router;
