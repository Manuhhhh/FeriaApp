import { jwtVerify, SignJWT } from "jose";
export const getJwtSecretKey = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_ENCRYPTION_KEY environment variable is not set");
    }
    return secret;
};
export const verifyJwt = async (token) => {
    const secret = getJwtSecretKey();
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
        return payload;
    }
    catch {
        return undefined;
    }
};
export async function signJwt(data, remember) {
    const secret = getJwtSecretKey();
    const jwt = new SignJWT(data)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt();
    if (!remember) {
        jwt.setExpirationTime("3h");
    }
    const token = jwt.sign(new TextEncoder().encode(secret));
    return token;
}
