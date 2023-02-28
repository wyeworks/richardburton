import { signOut } from "next-auth/react";
import { FC } from "react";
import Button from "./Button";
import ExitIcon from "assets/exit.svg";

const SignOutButton: FC = () => {
  return (
    <Button
      label="Sign out"
      type="outline"
      alignment="left"
      onClick={() => signOut({ callbackUrl: "/" })}
      Icon={ExitIcon}
      width="fixed"
    />
  );
};

export default SignOutButton;
