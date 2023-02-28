import { Request, Response, Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  inputValidationMiddleware,
  loginOrEmailValidation,
  passwordValidation,
} from "../middlewares/inputValidationMiddleware";
import { authRepository } from "../repositories/authRepository";
import { usersRepository } from "../repositories/usersRepository";
import { authService } from "../services/authService";
import { LoginSuccessViewModel, MeViewModel } from "../types/authType";
import { UserDBModel } from "../types/dbType";

export const authRouter = Router({});

authRouter.post(
  "/login",
  loginOrEmailValidation,
  passwordValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const authPost: LoginSuccessViewModel | null = await authService.postAuth(
      req.body.loginOrEmail,
      req.body.password
    );
    if (authPost) {
      res.status(200).send(authPost);
    } else {
      res.send(401);
    }
  }
);

authRouter.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const authGet: UserDBModel | null = await usersRepository.findUserById(
    req.user.id
  );
  const viewAuthGet: MeViewModel = {
    email: authGet!.email,
    login: authGet!.login,
    userId: authGet!.id,
  };
  res.status(200).send(viewAuthGet);
});

authRouter.post(
  "/registration",
  authMiddleware,
  async (req: Request, res: Response) => {
    const emailOrLoginFinder: UserDBModel[] | null =
      await authRepository.findUsersByLoginAndEmail(
        req.body.login,
        req.body.email
      );
    if (emailOrLoginFinder) {
      res.status(400).send({
        errorsMessages: [
          { message: "login or email already exists", field: "email" },
        ],
      });
    } else {
    const registationPost: UserDBModel = await authService.createUser(
      req.body.login,
      req.body.email,
      req.body.password,
    );
    res.send(204)
    }
  }
);
