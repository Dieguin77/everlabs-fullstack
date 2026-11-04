/**
 * The Prisma model names the author of a comment `author` / `authorId`, while the API (and
 * the frontend) expose it as `user` / `userId`.
 *
 * Querying Prisma with `user` / `userId` makes it throw a validation error, which used to
 * turn every task detail, comment and tag-on-task request into a 500. Repositories query
 * with the schema names and pass the result through this mapper.
 */
type WithAuthor = { authorId: number; author?: unknown };

export function toApiComment<C extends WithAuthor>(comment: C) {
  const { author, ...rest } = comment;

  return { ...rest, userId: comment.authorId, user: author };
}
