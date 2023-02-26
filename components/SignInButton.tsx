import { signIn } from "next-auth/react";
import { FC } from "react";
import Button from "./Button";
import GoogleIcon from "assets/google.svg";

const SignInButton: FC = () => {
  return (
    <Button
      className="w-48"
      label="Sign in"
      type="outline"
      alignment="left"
      onClick={() => signIn("google")}
      Icon={GoogleIcon}
    />
  );
};

export default SignInButton;
