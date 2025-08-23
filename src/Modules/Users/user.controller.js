import { Router } from "express";
import * as userService from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";

const router = Router();

router.post("/add", userService.SignUpService);
router.put("/update", authenticationMiddleware, userService.updateUserService);
router.delete("/delete/:id", authenticationMiddleware, userService.deleteUserService);
router.get("/list", authenticationMiddleware, userService.listUsersService);
router.post("/signin", userService.SignInService);
router.put("/confirmEmail", authenticationMiddleware, userService.confirmEmailService);
router.post("/logout", authenticationMiddleware, userService.logoutUserService);

export default router;