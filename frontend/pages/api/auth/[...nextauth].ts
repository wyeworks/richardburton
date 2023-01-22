import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

import { http } from "app";
import { User } from "modules/users";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId) throw "Must provide a client id for authentication.";
if (!clientSecret) throw "Must provide a client secret for authentication.";

const authOptions: AuthOptions = {
  providers: [GoogleProvider({ clientId, clientSecret })],
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  callbacks: {
    async signIn(params) {
      let user: User | null = null;
      try {
        const { email } = params.user;
        const { data } = await http.post<User>(
          "/users",
          { email },
          { headers: { Authorization: `Bearer ${params.account?.id_token}` } }
        );
        user = data;
      } catch (e) {
        console.log(e);
        if (axios.isAxiosError(e) && e.response && e.response.status === 409) {
          user = e.response.data as User;
        }
      }

      return user ? User.isAdmin(user.role) : false;
    },
    async jwt({ token, account }) {
      if (account) {
        token.idToken = account.id_token;
      }
      return token;
    },

    async session({ session, token }) {
      session.idToken = token.idToken;
      return session;
    },
  },
};

export default NextAuth(authOptions);
export { authOptions };
