import GoogleIcon from "assets/google.svg";
import { signIn } from "next-auth/react";
import { FC } from "react";
import Button from "./Button";

const SignInButton: FC = () => {
  return (
    <Button
      label="Sign in"
      variant="outline"
      alignment="left"
      onClick={() => signIn("google")}
      Icon={GoogleIcon}
      width="fixed"
    />
  );
};

export default SignInButton;
