import { FC, PropsWithChildren } from "react";
import Link from "next/link";
import c from "classnames";

type Props = PropsWithChildren & { compact?: boolean };

const HEADING_TEXT = "Richard Burton Platform";
const SUBHEADING_TEXT = " A database about Brazilian literature in translation";

const Header: FC<Props> = ({ compact, children }) => {
  const large = !compact;

  return (
    <header>
      <h1
        className={c({
          "py-2 text-center text-white bg-indigo-600": compact,
          "my-4 text-center": large,
        })}
      >
        <div
          className={c({
            "px-4 py-1 text-xl font-medium border-r inline": compact,
            "text-5xl": large,
          })}
        >
          <Link href="/">{HEADING_TEXT}</Link>
        </div>
        <div
          className={c({
            "px-4 text-lg inline": compact,
            "text-2xl tracking-wide": large,
          })}
        >
          {SUBHEADING_TEXT}
        </div>
      </h1>
      {children}
    </header>
  );
};

export default Header;
