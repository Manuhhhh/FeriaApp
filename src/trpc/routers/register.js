import { UsersTable } from "@/structures/Users";
import { publicProcedure } from "@/trpc/trpc";
import { z } from "zod";
export const registerRouter = publicProcedure
    .input(z.object({
    email: z.string().email().max(100),
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(50)
}))
    .output(z.object({ message: z.string(), error: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
    const { email, username, password } = input;
    const [result, token] = await UsersTable.create({ email, username, password });
    if (result === 'email') {
        return { error: "Email already exists", message: "1" };
    }
    if (result === 'username') {
        return { error: "Username already exists", message: "2" };
    }
    if (token) {
        ctx.res.setCookie("user-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });
    }
    return { message: "Register successful" };
});
