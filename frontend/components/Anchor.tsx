import Link from "next/link";
import { FC, PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  query?: string;
  href?: string;
}

const Anchor: FC<Props> = ({ query, href = "", children }) => {
  const Tag = href.startsWith("http") ? "a" : Link;

  return (
    <Tag href={`${href}${query ? `?${query}` : ""}`} className="group">
      {children}
      <div
        role="presentation"
        className="w-0 h-px mx-auto -mt-px transition-all bg-current group-hover:w-full"
      />
    </Tag>
  );
};

export default Anchor;
