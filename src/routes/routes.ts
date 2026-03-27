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
import { deletePostShema } from "../shema/postShema.js";
import { upload } from "../config/multer.js";
import LoginUserController from "../controllers/user/loginUserController.js";
import ForgotPasswordController from "../controllers/user/forgotPasswordController.js";
import ResetPasswordController from "../controllers/user/resetPasswordController.js";
import { CreatedPostController } from "../controllers/post/CreatedPostController.js";
import { authPostMiddleware } from "../middlewares/authPostMiddleware.js";
import { ListPostController } from "../controllers/post/ListPostController.js";
import { UpdatePostController } from "../controllers/post/UpdatedPostController.js";
import { DeletePostController } from "../controllers/post/DeletePostController.js";

const router = Router();

// Cadastrar
router.post(
  "/register",
  upload.single("photo_profile"),
  validateSchema(registerShema),
  new RegisterController().handle
);

// Listar usuários
router.get("/users", new ListUsersController().handle);

//Login
router.post("/login",
   validateSchema(loginShema),
    new LoginUserController().handle
);

// Envio de email
router.post(
  "/forgot-password",
  validateSchema(forgotPasswordShema),
  new ForgotPasswordController().handle
);

// Reset password
router.post(
  "/reset-password/:token",
  validateSchema(resetPasswordShema),
  new ResetPasswordController().handle
);

// Criar post
router.post("/createdpost",
  authPostMiddleware,
  upload.array("files"),
  new CreatedPostController().handle
)

// Listar posts
router.get("/posts",new ListPostController().handle)

router.patch(
  "/posts/:postId",
  authPostMiddleware,
  upload.array("files"),
  new UpdatePostController().handle
)

router.delete(
  "/posts/:postId",
  authPostMiddleware,
  validateSchema(deletePostShema),
  new DeletePostController().handle
)

export default router;
