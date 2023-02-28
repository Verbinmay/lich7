import { Request, Response, Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  contentCommentCreateValidation,
  inputValidationMiddleware,
} from "../middlewares/inputValidationMiddleware";
import { commentsRepository } from "../repositories/commentsRepository";
import { commentsService } from "../services/commentsService";
import { CommentViewModel } from "../types/commentsType";
import { CommentDBModel } from "../types/dbType";

export const commentsRouter = Router({});
//GET
commentsRouter.get("/:id", async (req: Request, res: Response) => {
  const commentGetById: CommentDBModel | null =
    await commentsRepository.findCommentById(req.params.id);

  if (commentGetById) {
    const viewCommentGetByid: CommentViewModel = {
      id: commentGetById.id,
      content: commentGetById.content,
      commentatorInfo: {
        userId: commentGetById.commentatorInfo.userId,
        userLogin: commentGetById.commentatorInfo.userLogin,
      },
      createdAt: commentGetById.createdAt,
    };
    res.status(200).send(viewCommentGetByid);
  } else {
    res.send(404);
  }
});

//PUT
commentsRouter.put(
  "/:commentId",
  authMiddleware,
  contentCommentCreateValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const commentFind: CommentDBModel | null =
      await commentsRepository.findCommentById(req.params.commentId);
    if (commentFind) {
      if (commentFind.commentatorInfo.userId === req.user.id) {
        const commentUpdate: boolean = await commentsService.updateComment(
          commentFind.id,
          req.body.content
        );
        if (commentUpdate) {
          res.send(204);
        } else {
          res.send(404);
        }
      } else {
        res.send(403);
      }
    } else {
      res.send(404);
    }
  }
);

//DELETE
commentsRouter.delete(
  "/:commentId",
  authMiddleware,
  async (req: Request, res: Response) => {
    const commentFind: CommentDBModel | null =
      await commentsRepository.findCommentById(req.params.commentId);
    if (commentFind) {
      if (commentFind.commentatorInfo.userId === req.user.id) {
        const commentDelete: boolean = await commentsService.deleteComment(
          commentFind.id
        );
        if (commentDelete) {
          res.send(204);
        } else {
          res.send(404);
        }
      } else {
        res.send(403);
      }
    } else {
      res.send(404);
    }
  }
);
