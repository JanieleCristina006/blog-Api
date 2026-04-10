import { Router } from "express";
import { upload } from "../config/multer.js";
import { CreateCategoryController } from "../controllers/category/CreateCategoryController.js";
import { DeleteCategoryController } from "../controllers/category/DeleteCategoryController.js";
import { ListCategoryController } from "../controllers/category/ListCategoryController.js";
import { UpdateCategoryController } from "../controllers/category/UpdateCategoryController.js";
import { CreateCommentController } from "../controllers/comment/CreateCommentController.js";
import { DeleteCommentController } from "../controllers/comment/DeleteCommentController.js";
import { ListCommentController } from "../controllers/comment/ListCommentController.js";
import { CreateLikeController } from "../controllers/like/CreateLikeController.js";
import { DeleteLikeController } from "../controllers/like/DeleteLikeController.js";
import { ListLikeController } from "../controllers/like/ListLikeController.js";
import { CreatedPostController } from "../controllers/post/CreatedPostController.js";
import { DeletePostController } from "../controllers/post/DeletePostController.js";
import { ListPostController } from "../controllers/post/ListPostController.js";
import { UpdatePostController } from "../controllers/post/UpdatedPostController.js";
import ForgotPasswordController from "../controllers/user/forgotPasswordController.js";
import ListUsersController from "../controllers/user/listUsersController.js";
import LoginUserController from "../controllers/user/loginUserController.js";
import RegisterController from "../controllers/user/registerUserController.js";
import ResetPasswordController from "../controllers/user/resetPasswordController.js";
import { authPostMiddleware } from "../middlewares/authPostMiddleware.js";
import { authUserMiddleware } from "../middlewares/authUserMiddleware.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import {
  createCategoryShema,
  deleteCategoryShema,
  updateCategoryShema,
} from "../shema/categoryShema.js";
import {
  createCommentShema,
  deleteCommentShema,
  listCommentShema,
} from "../shema/commentShema.js";
import { postLikeParamsShema } from "../shema/likeShema.js";
import {
  createPostShema,
  deletePostShema,
  updatePostShema,
} from "../shema/postShema.js";
import {
  forgotPasswordShema,
  loginShema,
  registerShema,
  resetPasswordShema,
} from "../shema/userShema.js";

const router = Router();

router.get("/health", (req, res) => {
  return res.status(200).json({ status: "ok" });
});

router.post(
  "/register",
  upload.single("photo_profile"),
  validateSchema(registerShema),
  new RegisterController().handle
);

router.get("/users", new ListUsersController().handle);

router.post(
  "/login",
  validateSchema(loginShema),
  new LoginUserController().handle
);

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

router.post(
  "/createdpost",
  authPostMiddleware,
  upload.array("files"),
  validateSchema(createPostShema),
  new CreatedPostController().handle
);

router.get("/posts", new ListPostController().handle);

router.patch(
  "/posts/:postId",
  authPostMiddleware,
  upload.array("files"),
  validateSchema(updatePostShema),
  new UpdatePostController().handle
);

router.delete(
  "/posts/:postId",
  authPostMiddleware,
  validateSchema(deletePostShema),
  new DeletePostController().handle
);

router.post(
  "/posts/:postId/comments",
  authUserMiddleware,
  validateSchema(createCommentShema),
  new CreateCommentController().handle
);

router.get(
  "/posts/:postId/comments",
  validateSchema(listCommentShema),
  new ListCommentController().handle
);

router.delete(
  "/comments/:commentId",
  authPostMiddleware,
  validateSchema(deleteCommentShema),
  new DeleteCommentController().handle
);

router.post(
  "/posts/:postId/likes",
  authUserMiddleware,
  validateSchema(postLikeParamsShema),
  new CreateLikeController().handle
);

router.get(
  "/posts/:postId/likes",
  validateSchema(postLikeParamsShema),
  new ListLikeController().handle
);

router.delete(
  "/posts/:postId/likes",
  authUserMiddleware,
  validateSchema(postLikeParamsShema),
  new DeleteLikeController().handle
);

router.post(
  "/categories",
  authPostMiddleware,
  validateSchema(createCategoryShema),
  new CreateCategoryController().handle
);

router.get("/categories", new ListCategoryController().handle);

router.patch(
  "/categories/:categoryId",
  authPostMiddleware,
  validateSchema(updateCategoryShema),
  new UpdateCategoryController().handle
);

router.delete(
  "/categories/:categoryId",
  authPostMiddleware,
  validateSchema(deleteCategoryShema),
  new DeleteCategoryController().handle
);

export default router;
