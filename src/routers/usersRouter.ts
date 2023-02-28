import { Request, Response, Router } from "express";
import { basicValidationMiddleware } from "../middlewares/basicMiddleware";
import {
  emailCreateValidation,
  inputValidationMiddleware,
  loginCreateValidation,
  passwordCreateValidation,
} from "../middlewares/inputValidationMiddleware";
import { paginator } from "../paginator";
import { usersRepository } from "../repositories/usersRepository";
import { usersService } from "../services/usersService";
import { UserDBModel } from "../types/dbType";
import {
  PaginatorEnd,
  PaginatorStart,
  PaginatorUser,
} from "../types/paginatorType";

export const usersRouter = Router({});

//POST
usersRouter.post(
  "/",
  basicValidationMiddleware,
  loginCreateValidation,
  passwordCreateValidation,
  emailCreateValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const userPost = await usersService.createUser(
      req.body.login,
      req.body.password,
      req.body.email
    );
    const viewUserPost = {
      id: userPost!.id,
      login: userPost!.login,
      email: userPost!.email,
      createdAt: userPost!.createdAt,
    };
    res.status(201).send(viewUserPost);
  }
);

//GET
usersRouter.get(
  "/",
  basicValidationMiddleware,
  async (req: Request, res: Response) => {
    const paginatorInformation: PaginatorStart = paginator(req.query);
    const usersGet: {
      paginatorEndInfo: PaginatorEnd;
      result: Array<UserDBModel>;
    } = await usersRepository.findUsers(paginatorInformation);
    const viewUsersGet: PaginatorUser = {
      pagesCount: usersGet.paginatorEndInfo.pagesCount,
      page: usersGet.paginatorEndInfo.page,
      pageSize: usersGet.paginatorEndInfo.pageSize,
      totalCount: usersGet.paginatorEndInfo.totalCount,
      items: usersGet.result.map((m) => {
        return {
          id: m.id,
          login: m.login,
          email: m.email,
          createdAt: m.createdAt,
        };
      }),
    };
    res.status(200).send(viewUsersGet);
  }
);

//DELETE
usersRouter.delete(
  "/:id",
  basicValidationMiddleware,
  async (req: Request, res: Response) => {
    const userDelete: boolean = await usersService.deleteUser(req.params.id);
    if (userDelete) {
      res.send(204);
    } else {
      res.send(404);
    }
  }
);
