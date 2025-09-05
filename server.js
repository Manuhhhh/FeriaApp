import Fastify from 'fastify';
import * as dotenv from 'dotenv';
import fastifyCookie from '@fastify/cookie';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from '@/trpc/_app';
import { createContext } from '@/trpc/trpc';
import setupDB from '@/lib/setupDatabase';
dotenv.config({ path: '.env' });
const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const fastify = Fastify({ logger: dev });
async function main() {
    await setupDB();
    await fastify.register(fastifyCookie);
    await fastify.register(fastifyTRPCPlugin, {
        prefix: '/api/trpc',
        trpcOptions: {
            router: appRouter,
            createContext,
            onError({ path, error }) {
                console.error(`Error in tRPC handler on path '${path}':`, error);
            },
            allowBatching: true,
        },
    });
    try {
        await fastify.listen({ port });
        console.log(`> Server listening at http://localhost:${port} as ${dev ? 'development' : process.env.NODE_ENV}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
main();
