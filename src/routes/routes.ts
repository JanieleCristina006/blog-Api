import { Router } from "express";
import RegisterController from "../controllers/user/registerUserController.js";
import ListUsersController from "../controllers/user/listUsersController.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { loginShema, registerShema } from "../shema/userShema.js";
import { upload } from "../config/multer.js";
import LoginUserController from "../controllers/user/loginUserController.js";


const router = Router();

// Registrar Usúario
router.post("/register",
    upload.single("photo_profile"),
    validateSchema(registerShema),
    new RegisterController().handle
)

// Listar usuarios
router.get("/users", 
    new ListUsersController().handle
);

router.post("/login",validateSchema(loginShema),new LoginUserController().handle)


export default  router ;
