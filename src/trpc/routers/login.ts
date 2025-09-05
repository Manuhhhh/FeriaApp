import { UsersTable } from "@/structures/Users";
import { publicProcedure } from "@/trpc/trpc";
import { z } from "zod";

export const loginRouter = publicProcedure
    .input(
        z.object({
            emailOrUsername: z.string().email("Invalid email").max(100),
            password: z.string().min(6).max(50),
            remember: z.boolean().optional(),
        })
    )
    .output(z.object({ message: z.string(), status: z.number() }))
    .mutation(async ({ input, ctx }) => {
        const { emailOrUsername, password, remember } = input;

        const result = await UsersTable.login({ emailOrUsername, password, remember });

        if (!result) {
            return { message: "Invalid credentials", status: 0 };
        }

        ctx.res.setCookie("user-token", result, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        return { message: "Login successful", status: 1 };
    });   