import { signIn } from "next-auth/react";
import { FC } from "react";
import Button from "./Button";
import GoogleIcon from "assets/google.svg";

const SignInButton: FC = () => {
  return (
    <Button
      label="Sign in"
      type="outline"
      alignment="left"
      onClick={() => signIn("google")}
      Icon={GoogleIcon}
      width="fixed"
    />
  );
};

export default SignInButton;
