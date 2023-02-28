import { ObjectId } from "mongodb";
import { blogsRepository } from "../repositories/blogsRepository";
import { BlogDBModel } from "../types/dbType";

export const blogsService = {
  //CREATE
  async createBlog(name: string, description: string, websiteUrl: string) {
    const createdBlog = {
      name: name,
      description: description,
      websiteUrl: websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };

    const result :BlogDBModel = await blogsRepository.createBlog(createdBlog);
    return result;
  },
  //UPDATE
  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string
  ) {
    const result = await blogsRepository.updateBlog(
      id,
      name,
      description,
      websiteUrl
    );
    return result;
  },

  //DELETE
  async deleteBlog(id: string) {
    const result = await blogsRepository.deleteBlog(id);
    return result;
  },

  //POST-POST-BLOGID
  async postPostByBlogId(
    blogGetByID: BlogDBModel,
    title: string,
    shortDescription: string,
    content: string
  ) {
    const createdPost = {
      title: title,
      shortDescription: shortDescription,
      content: content,
      blogId: blogGetByID.id,
      blogName: blogGetByID.name,
      createdAt: new Date().toISOString(),
    };

    const result = await blogsRepository.postPostByBlogId(createdPost);
    return result;
  },
};
