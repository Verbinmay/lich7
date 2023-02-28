import { blogsRepository } from "../repositories/blogsRepository";
import { postsRepository } from "../repositories/postsRepository";
import { BlogDBModel, CommentDBModel, UserDBModel } from "../types/dbType";

export const postsService = {
  //POST

  async createPost(
    title: string,
    shortDescription: string,
    content: string,
    blog: BlogDBModel
  ) {
    const createdPost = {
      title: title,
      shortDescription: shortDescription,
      content: content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: new Date().toISOString(),
    };
    const result = await postsRepository.crearePost(createdPost);
    return result;
  },
  //PUT
  async updatePost(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string
  ) {
    const blogName =( await blogsRepository.findBlogById(blogId))!.name
    const result: boolean = await postsRepository.updatePost(
      id,
      title,
      shortDescription,
      content,
      blogId,
      blogName
    );
    return result;
  },

  //DELETE
  async deletePost(id: string) {
    const result: boolean = await postsRepository.deletePost(id);
    return result;
  },

  //POSTCOMMENTSBYPOSTID
  async createCommentsByPostId(
    content: string,
    user: UserDBModel,
    postId: string
  ) {
    const createdComment = {
      content: content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      createdAt: new Date().toISOString(),
      postId: postId,
    };
    const result = await postsRepository.createCommentsByPostId(createdComment);
    return result;
  },
};
