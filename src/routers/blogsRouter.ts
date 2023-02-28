import { Request, Response, Router } from "express";
import { basicValidationMiddleware } from "../middlewares/basicMiddleware";
import {
  contentValidation,
  descriptionValidation,
  inputValidationMiddleware,
  nameValidation,
  shortDescriptionValidation,
  titleValidation,
  websiteUrlValidation,
} from "../middlewares/inputValidationMiddleware";
import { paginator } from "../paginator";
import { blogsRepository } from "../repositories/blogsRepository";
import { blogsService } from "../services/blogsService";
import { BlogViewModel } from "../types/blogsType";
import { BlogDBModel, PostDBModel } from "../types/dbType";
import {
  PaginatorEnd,
  PaginatorBlog,
  PaginatorPost,
  PaginatorStart,
} from "../types/paginatorType";
import { PostViewModel } from "../types/postsType";

export const blogsRouter = Router({});

//GET

blogsRouter.get("/", async (req: Request, res: Response) => {
  const paginatorInformation:PaginatorStart = paginator(req.query);

  const blogsGet: {
    paginatorEndInfo: PaginatorEnd;
    result: Array<BlogDBModel>;
  } = await blogsRepository.findBlogs(paginatorInformation);

  const viewBlogsGet: PaginatorBlog = {
    pagesCount: blogsGet.paginatorEndInfo.pagesCount,
    page: blogsGet.paginatorEndInfo.page,
    pageSize: blogsGet.paginatorEndInfo.pageSize,
    totalCount: blogsGet.paginatorEndInfo.totalCount,
    items: blogsGet.result.map((m) => {
      return {
        id: m.id,
        name: m.name,
        description: m.description,
        websiteUrl: m.websiteUrl,
        createdAt: m.createdAt,
        isMembership: m.isMembership,
      };
    }),
  };
  res.status(200).send(viewBlogsGet);
});

blogsRouter.get("/:id", async (req: Request, res: Response) => {
  const blogGetByID: BlogDBModel | null = await blogsRepository.findBlogById(
    req.params.id
  );

  if (blogGetByID) {
    const viewBlogGetById: BlogViewModel = {
      id: blogGetByID.id,
      name: blogGetByID.name,
      description: blogGetByID.description,
      websiteUrl: blogGetByID.websiteUrl,
      createdAt: blogGetByID.createdAt,
      isMembership: blogGetByID.isMembership,
    };
    res.status(200).send(viewBlogGetById);
  } else {
    res.send(404);
  }
});
//POST

blogsRouter.post(
  "/",
  basicValidationMiddleware,
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const blogPost: BlogDBModel | null = await blogsService.createBlog(
      req.body.name,
      req.body.description,
      req.body.websiteUrl
    );

    const viewBlogPost: BlogViewModel = {
      id: blogPost!.id,
      name: blogPost!.name,
      description: blogPost!.description,
      websiteUrl: blogPost!.websiteUrl,
      createdAt: blogPost!.createdAt,
      isMembership: blogPost!.isMembership,
    };
    res.status(201).send(viewBlogPost);
  }
);

//PUT
blogsRouter.put(
  "/:id",
  basicValidationMiddleware,
  nameValidation,
  descriptionValidation,
  websiteUrlValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const blogPut: boolean = await blogsService.updateBlog(
      req.params.id,
      req.body.name,
      req.body.description,
      req.body.websiteUrl
    );
    blogPut ? res.send(204) : res.send(404);
  }
);

//DELETE
blogsRouter.delete(
  "/:id",
  basicValidationMiddleware,
  async (req: Request, res: Response) => {
    const blogDelete: boolean = await blogsService.deleteBlog(req.params.id);
    blogDelete ? res.send(204) : res.send(404);
  }
);

//POST-POST-BLOGID
blogsRouter.post(
  "/:blogId/posts",
  basicValidationMiddleware,
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const blogGetByID: BlogDBModel | null = await blogsRepository.findBlogById(
      req.params.blogId
    );
    if (blogGetByID) {
      const postPostBlogId: PostDBModel | null =
        await blogsService.postPostByBlogId(
          blogGetByID,
          req.body.title,
          req.body.shortDescription,
          req.body.content
        );
      const viewPostPostBlogId: PostViewModel = {
        id: postPostBlogId!.id,
        title: postPostBlogId!.title,
        shortDescription: postPostBlogId!.shortDescription,
        content: postPostBlogId!.content,
        blogId: postPostBlogId!.blogId,
        blogName: postPostBlogId!.blogName,
        createdAt: postPostBlogId!.createdAt,
      };
      res.status(201).send(viewPostPostBlogId);
    } else {
      res.send(404);
    }
  }
);

//GET-POST-BLOGID
blogsRouter.get("/:blogId/posts", async (req: Request, res: Response) => {
  const paginatorInformation:PaginatorStart = paginator(req.query);

  const blogGetById: BlogDBModel | null = await blogsRepository.findBlogById(
    req.params.blogId
  );

  if (blogGetById) {
    const postGetBlogId: {
      paginatorEndInfo: PaginatorEnd;
      result: Array<PostDBModel>;
    } = await blogsRepository.findPostsByBlogId(
      paginatorInformation,
      blogGetById.id
    );

    const viewPostGetBlogId: PaginatorPost = {
      pagesCount: postGetBlogId.paginatorEndInfo.pagesCount,
      page: postGetBlogId.paginatorEndInfo.page,
      pageSize: postGetBlogId.paginatorEndInfo.pageSize,
      totalCount: postGetBlogId.paginatorEndInfo.totalCount,
      items: postGetBlogId.result.map((m) => {
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
    res.status(200).send(viewPostGetBlogId);
  } else {
    res.send(404);
  }
});
