import { initTRPC, TRPCError } from '@trpc/server';
import SuperJSON from 'superjson';
import { verifyJwt } from '../lib/auth';
export function createContext({ req, res }) {
    return {
        req,
        res,
    };
}
const t = initTRPC.context().create({
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
