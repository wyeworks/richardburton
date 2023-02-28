import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const SignIn: NextPage = () => {
  const router = useRouter();
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";
  const isLoading = session.status === "loading";

  useEffect(() => {
    if (isAuthenticated) {
      router.push(router.query.callbackUrl as string);
    } else if (!isLoading) {
      signIn("google");
    }
  }, [router, isAuthenticated, isLoading]);

  return null;
};

export default SignIn;
