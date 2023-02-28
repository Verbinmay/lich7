import { CommentDBModel } from "../types/dbType";
import { commentsCollections } from "./db";

export const commentsRepository = {
  //GETBYID
  async findCommentById(id: string) {
    const result: CommentDBModel | null = await commentsCollections.findOne({
      id: id,
    });
    return result;
  },

  //POST
  async updateComment(commentId: string, content: string) {
    const result = await commentsCollections.updateOne(
      { id: commentId },
      { $set: { content: content } }
    );
    return result.modifiedCount === 1;
  },

  //DELETE
  async deleteComment(commentId: string) {
    const result = await commentsCollections.deleteOne({ id: commentId });
    return result.deletedCount === 1;
  },
};
