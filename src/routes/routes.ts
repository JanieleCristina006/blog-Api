import { Router } from "express";
import RegisterController from "../controllers/user/registerUserController.js";
import ListUsersController from "../controllers/user/listUsersController.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import {
  forgotPasswordShema,
  loginShema,
  registerShema,
  resetPasswordShema,
} from "../shema/userShema.js";
import { upload } from "../config/multer.js";
import LoginUserController from "../controllers/user/loginUserController.js";
import ForgotPasswordController from "../controllers/user/forgotPasswordController.js";
import ResetPasswordController from "../controllers/user/resetPasswordController.js";

const router = Router();

router.post(
  "/register",
  upload.single("photo_profile"),
  validateSchema(registerShema),
  new RegisterController().handle
);

router.get("/users", new ListUsersController().handle);

router.post("/login", validateSchema(loginShema), new LoginUserController().handle);

router.post(
  "/forgot-password",
  validateSchema(forgotPasswordShema),
  new ForgotPasswordController().handle
);

router.post(
  "/reset-password/:token",
  validateSchema(resetPasswordShema),
  new ResetPasswordController().handle
);

export default router;
