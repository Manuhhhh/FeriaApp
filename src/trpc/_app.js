import { router } from './trpc';
import { loginRouter } from './routers/login';
import { registerRouter } from './routers/register';
const routers = {
    login: loginRouter,
    register: registerRouter,
};
export const appRouter = router(routers);
