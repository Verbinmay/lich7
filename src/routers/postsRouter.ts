import { Request, Response, Router } from "express";
import { serialize } from "v8";
import { authMiddleware } from "../middlewares/authMiddleware";
import { basicValidationMiddleware } from "../middlewares/basicMiddleware";
import {
  contentCommentCreateValidation,
  contentValidation,
  inputValidationMiddleware,
  isBlogIdValidation,
  shortDescriptionValidation,
  titleValidation,
} from "../middlewares/inputValidationMiddleware";
import { paginator } from "../paginator";
import { postsRepository } from "../repositories/postsRepository";
import { postsService } from "../services/postsService";
import { CommentDBModel, PostDBModel } from "../types/dbType";
import {
  PaginatorCommentViewModel,
  PaginatorEnd,
  PaginatorPost,
  PaginatorStart,
} from "../types/paginatorType";
import { PostViewModel } from "../types/postsType";
import { blogsRouter } from "./blogsRouter";

export const postsRouter = Router({});

//GET
postsRouter.get("/", async (req: Request, res: Response) => {
  const paginatorInformation = paginator(req.query);

  const postsGet: {
    paginatorEndInfo: PaginatorEnd;
    result: Array<PostDBModel>;
  } = await postsRepository.findPosts(paginatorInformation);

  const viewPostsGet: PaginatorPost = {
    pagesCount: postsGet.paginatorEndInfo.pagesCount,
    page: postsGet.paginatorEndInfo.page,
    pageSize: postsGet.paginatorEndInfo.pageSize,
    totalCount: postsGet.paginatorEndInfo.totalCount,
    items: postsGet.result.map((m) => {
      return {
        id: m.id,
        title: m.title,
        shortDescription: m.shortDescription,
        content: m.content,
        blogId: m.blogId,
        blogName: m.blogName,
        createdAt: m.createdAt,
      };
    }),
  };
  res.status(200).send(viewPostsGet);
});

postsRouter.get("/:id", async (req: Request, res: Response) => {
  const postGetById: PostDBModel | null = await postsRepository.findPostById(
    req.params.id
  );

  if (postGetById) {
    const viewPostGetById: PostViewModel = {
      id: postGetById.id,
      title: postGetById.title,
      shortDescription: postGetById.shortDescription,
      content: postGetById.content,
      blogId: postGetById.blogId,
      blogName: postGetById.blogName,
      createdAt: postGetById.createdAt,
    };
    res.status(200).send(viewPostGetById);
  } else {
    res.send(404);
  }
});

//POST
postsRouter.post(
  "/",
  basicValidationMiddleware,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  isBlogIdValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const postPost = await postsService.createPost(
      req.body.title,
      req.body.shortDescription,
      req.body.content,
      req.blog
    );

    const viewPostPost = {
      id: postPost!.id,
      title: postPost!.title,
      shortDescription: postPost!.shortDescription,
      content: postPost!.content,
      blogId: postPost!.blogId,
      blogName: postPost!.blogName,
      createdAt: postPost!.createdAt,
    };
    res.status(201).send(viewPostPost);
  }
);

//PUT

postsRouter.put(
  "/:id",
  basicValidationMiddleware,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  isBlogIdValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const postGetById: PostDBModel | null = await postsRepository.findPostById(
      req.params.id
    );

    if (postGetById) {
      const postUpdate: boolean = await postsService.updatePost(
        postGetById.id,
        req.body.title,
        req.body.shortDescription,
        req.body.content,
        req.body.blogId
      );
      if (postUpdate) {
        res.send(204);
        return;
      }
    } else {
      res.send(404);
    }
  }
);

//DELETE
postsRouter.delete(
  "/:id",
  basicValidationMiddleware,
  async (req: Request, res: Response) => {
    const postGetById: PostDBModel | null = await postsRepository.findPostById(
      req.params.id
    );

    if (postGetById) {
      const postDelete: boolean = await postsService.deletePost(req.params.id);

      if (postDelete) {
        res.send(204);
        return;
      }
    } else {
      res.send(404);
    }
  }
);

//POSTCOMMENTSBYPOSTID

postsRouter.post(
  "/:postId/comments",
  authMiddleware,
  contentCommentCreateValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const postGetById: PostDBModel | null = await postsRepository.findPostById(
      req.params.postId
    );

    if (postGetById) {
      const commentPostPostId = await postsService.createCommentsByPostId(
        req.body.content,
        req.user,
        postGetById.id
      );

      const viewCommentPostPostId = {
        id: commentPostPostId!.id,
        content: commentPostPostId!.content,
        commentatorInfo: {
          userId: commentPostPostId!.commentatorInfo.userId,
          userLogin: commentPostPostId!.commentatorInfo.userLogin,
        },
        createdAt: commentPostPostId!.createdAt,
      };
      res.status(201).send(viewCommentPostPostId);
    } else {
      res.send(404);
    }
  }
);

//GETCOMMENTSBYPOSTID
postsRouter.get("/:postId/comments", async (req: Request, res: Response) => {
  const postGetById: PostDBModel | null = await postsRepository.findPostById(
    req.params.postId
  );

  if (postGetById) {
    const paginatorInformation: PaginatorStart = paginator(req.query);
    const commentsGetPostId: {
      paginatorEndInfo: PaginatorEnd;
      result: Array<CommentDBModel>;
    } = await postsRepository.getCommentsByPostId(
      paginatorInformation,
      postGetById.id
    );

    const viewcommentsGetPostId: PaginatorCommentViewModel = {
      pagesCount: commentsGetPostId.paginatorEndInfo.pagesCount,
      page: commentsGetPostId.paginatorEndInfo.page,
      pageSize: commentsGetPostId.paginatorEndInfo.pageSize,
      totalCount: commentsGetPostId.paginatorEndInfo.totalCount,
      items: commentsGetPostId.result.map((m) => {
        return {
          id: m.id,
          content: m.content,
          commentatorInfo: {
            userId: m.commentatorInfo.userId,
            userLogin: m.commentatorInfo.userLogin,
          },
          createdAt: m.createdAt,
        };
      }),
    };
    res.status(200).send(viewcommentsGetPostId);
  } else {
    res.send(404);
  }
});
