import ExitIcon from "assets/exit.svg";
import { signOut } from "next-auth/react";
import { FC } from "react";
import Button from "./Button";

const SignOutButton: FC = () => {
  return (
    <Button
      label="Sign out"
      variant="outline"
      alignment="left"
      onClick={() => signOut({ callbackUrl: "/" })}
      Icon={ExitIcon}
      width="fixed"
    />
  );
};

export default SignOutButton;
