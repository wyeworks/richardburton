import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

import { http } from "app";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId) throw "Must provide a client id for authentication.";
if (!clientSecret) throw "Must provide a client secret for authentication.";

const authOptions: AuthOptions = {
  providers: [GoogleProvider({ clientId, clientSecret })],
  pages: { signIn: "/auth/sign-in" },
  callbacks: {
    async signIn(params) {
      try {
        const { id: subject_id, email } = params.user;
        await http.post("/users", { subject_id, email });
        return true;
      } catch (e) {
        const isConflict =
          axios.isAxiosError(e) && e.response && e.response?.status === 409;

        if (isConflict) return true;

        console.error(e);
        return false;
      }
    },
  },
};

export default NextAuth(authOptions);
export { authOptions };
