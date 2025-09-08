import { Router } from "express";
import * as userService from "./Services/user.service.js";
import { authenticationMiddleware } from "../../Middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { privilegesEnum } from "../../Common/enums/user.enum.js";

const router = Router();

// Authentication Router
router.post("/add", userService.SignUpService);
router.post("/signin", userService.SignInService);
router.put("/confirmEmail", userService.confirmEmailService);
router.post("/logout", authenticationMiddleware, userService.logoutUserService);
router.post("/refreshToken", userService.refreshTokenService);

// Account Router
router.put("/update", authenticationMiddleware, userService.updateUserService);
router.delete("/delete", authenticationMiddleware, userService.deleteUserService);

// Admin - Authorization Router
router.get("/list",authenticationMiddleware, authorizationMiddleware(privilegesEnum.ADMINS), userService.listUsersService);

export default router;