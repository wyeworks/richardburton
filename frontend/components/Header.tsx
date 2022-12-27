import { FC } from "react";
import Link from "next/link";
import c from "classnames";

type Props = { compact?: boolean };

const HEADING_TEXT = "Richard Burton Platform";
const SUBHEADING_TEXT = " A database about Brazilian literature in translation";

const Header: FC<Props> = ({ compact }) => {
  const large = !compact;

  return (
    <header
      className={c({
        "py-2 text-center text-white bg-indigo-600": compact,
        "my-4 text-center": large,
      })}
    >
      <h1 className={c({ "my-4 text-center": large })}>
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
    </header>
  );
};

export default Header;
