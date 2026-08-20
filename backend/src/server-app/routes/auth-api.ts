import { Router } from "express"
import { handleInputErrors } from "../middleware/validation.js";
import { body } from "express-validator";
import { AuthControllers } from "../controllers/AuthControllers.js";
import { createHandler } from "../utils/createHandler.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post(
  "/login",
  body("email").isEmail().withMessage("Email no válido"),
  body("password").notEmpty().withMessage("El password no puede ir vacío"),
  handleInputErrors,
  createHandler(AuthControllers, 'login')
);


router.get('/perfil', authenticate, createHandler(AuthControllers, 'perfil'))
export default router;