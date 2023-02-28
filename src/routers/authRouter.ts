import { Request, Response, Router } from "express";
import { emailsAdapter } from "../adapters/emailAdapter";
import { registrationMessage } from "../adapters/messages";
import { errorMaker } from "../functions";
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

//REGISTRATION in the system. Email with confirmation code will be send to passed email address
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
      res
        .status(400)
        .send(errorMaker("login or email already exists", "email"));
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

//CONFIRM registration
authRouter.post(
  "/registration-confirmation",
  async (req: Request, res: Response) => {
    const confirmPost = await authService.confirmEmail(req.body.code);
    if (confirmPost) {
      res.send(201);
    } else {
      res
        .status(400)
        .send(
          errorMaker(
            "If the confirmation code is incorrect, expired or already been applied",
            "code"
          )
        );
    }
  }
);

//REGISTRATION EMAIL RESENDING 
authRouter.post(
  "/registration-email-resending",
  async (req: Request, res: Response) => {
const 
  })