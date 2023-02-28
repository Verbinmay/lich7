import { Request, Response, Router } from "express";
import { emailsAdapter } from "../adapters/emailAdapter";
import { registrationMessage } from "../adapters/messages";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  emailCreateValidation,
  inputValidationMiddleware,
  loginCreateValidation,
  loginOrEmailValidation,
  passwordCreateValidation,
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
  loginCreateValidation,
  passwordCreateValidation,
  emailCreateValidation,
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
        req.body.password
      );
      const message = await registrationMessage(
        registationPost.emailConfimation.confimationCode
      );
      await emailsAdapter.sendEmail(
        req.body.email,
        message.subject,
        message.result
      );
      res.send(204);
    }
  }
);
