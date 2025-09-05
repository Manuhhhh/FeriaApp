import { initTRPC, TRPCError } from '@trpc/server';
import type { FastifyRequest, FastifyReply } from 'fastify';
import SuperJSON from 'superjson';
import { verifyJwt } from '../lib/auth';

export type Context = {
  req: FastifyRequest;
  res: FastifyReply;
};

export function createContext({ req, res }: { req: FastifyRequest; res: FastifyReply }): Context {
  return {
    req,
    res,
  };
}

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON
});

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = ctx.req.cookies['user-token'];
  const validSession = await verifyJwt(token ?? "");

  if (!validSession) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      validSession
    },
  });
});


export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);