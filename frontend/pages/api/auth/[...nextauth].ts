import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId) throw "Must provide a client id for authentication.";
if (!clientSecret) throw "Must provide a client secret for authentication.";

const authOptions: AuthOptions = {
  providers: [GoogleProvider({ clientId, clientSecret })],
  pages: { signIn: "/auth/sign-in" },
};

export default NextAuth(authOptions);
export { authOptions };
