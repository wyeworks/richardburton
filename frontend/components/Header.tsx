import { FC, PropsWithChildren } from "react";
import Link from "next/link";

const HEADING_TEXT = "Richard Burton Platform";
const SUBHEADING_TEXT = " A database about Brazilian literature in translation";

const Header: FC<PropsWithChildren> = ({ children }) => {
  return (
    <header>
      <h1 className="py-1 text-center text-white bg-indigo-600">
        <div className="inline px-4 py-1 text-lg font-medium border-r">
          <Link href="/">{HEADING_TEXT}</Link>
        </div>
        <div className="inline px-4 text-base">{SUBHEADING_TEXT}</div>
      </h1>
      {children}
    </header>
  );
};

export default Header;
