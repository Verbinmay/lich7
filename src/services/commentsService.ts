import { commentsRepository } from "../repositories/commentsRepository";

export const commentsService = {
  //POST
  async updateComment(commentId: string, content: string) {
    const result: boolean = await commentsRepository.updateComment(
      commentId,
      content
    );
    return result;
  },

  //DELETE
  async deleteComment(commentId: string) {
    const result: boolean = await commentsRepository.deleteComment(commentId);
    return result;
  },
};
