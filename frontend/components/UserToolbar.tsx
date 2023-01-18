import { signIn, signOut, useSession } from "next-auth/react";
import { FC } from "react";
import Image from "next/image";
import Button from "./Button";
import GoogleIcon from "assets/google.svg";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const UserInfo: FC<SessionUser> = ({ name, email, image }) => {
  return (
    <>
      {image && (
        <div className="relative w-12 h-12 overflow-hidden rounded-full shrink-0">
          <Image alt="Avatar of the user" src={image} fill />
        </div>
      )}

      <div className="text-center">
        <div>{name}</div>
        <div className="text-xs">{email}</div>
      </div>
    </>
  );
};

const UserToolbar: FC = () => {
  const session = useSession();
  const isAuthenticated = session.status === "authenticated";

  return (
    <section className="flex flex-col items-center p-2 space-y-2 rounded shadow ">
      {isAuthenticated ? (
        <>
          <UserInfo {...(session.data.user || {})} />
          <Button
            label="Sign out"
            type="outline"
            onClick={() => signOut({ callbackUrl: "/" })}
          />
        </>
      ) : (
        <Button
          label="Sign in"
          type="outline"
          onClick={() => signIn("google")}
          Icon={GoogleIcon}
        />
      )}
    </section>
  );
};

export default UserToolbar;
