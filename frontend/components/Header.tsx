import { FC } from "react";
import Link from "next/link";

type Props = { compact?: boolean };

const Header: FC<Props> = ({ compact }) => {
  return compact ? (
    <header className="py-2 text-center text-white bg-indigo-600">
      <Link href="/" className="inline px-4 py-1 text-xl font-medium border-r">
        Richard Burton Platform
      </Link>
      <span className="inline px-4 text-lg">
        A database about Brazilian literature in translation
      </span>
    </header>
  ) : (
    <header className="my-4 text-center">
      <h1 className="text-5xl">Richard Burton Platform</h1>
      <h2 className="text-2xl">
        A database about Brazilian literature in translation
      </h2>
    </header>
  );
};

export default Header;
