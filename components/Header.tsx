import { FC } from "react";
import Link from "next/link";

type Props = { compact?: boolean };

const HEADING_TEXT = "Richard Burton Platform";
const SUBHEADING_TEXT = " A database about Brazilian literature in translation";

const Header: FC<Props> = ({ compact }) => {
  return compact ? (
    <header className="py-2 text-center text-white bg-indigo-600">
      <h1>
        <Link href="/" className="px-4 py-1 text-xl font-medium border-r ">
          {HEADING_TEXT}
        </Link>
        <span className="px-4 text-lg">{SUBHEADING_TEXT}</span>
      </h1>
    </header>
  ) : (
    <header className="my-4 text-center">
      <h1 className="text-5xl">
        <Link href="/">{HEADING_TEXT}</Link>
        <div className="text-2xl tracking-wide">{SUBHEADING_TEXT}</div>
      </h1>
    </header>
  );
};

export default Header;
