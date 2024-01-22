import Logo from "assets/logo.svg";
import clsx from "classnames";
import { FC, ReactNode } from "react";

interface Props {
  heading: ReactNode;
  content: ReactNode;
  aside?: ReactNode;
  noSeparator?: boolean;
}

const Article: FC<Props> = ({ content, heading, aside, noSeparator }) => {
  return (
    <article className="relative flex w-full min-h-full gap-5 p-8 overflow-clip">
      <Logo className="absolute z-50 text-indigo-700 pointer-events-none opacity-20 -left-1/2 -top-44 sm:-top-96 aspect-square" />
      {!noSeparator && (
        <hr className="absolute inset-x-7 top-28 sm:top-[5.5rem] z-40" />
      )}
      <section className={clsx("space-y-6 h-fit", aside ? "w-7/12" : "w-full")}>
        <header className="sticky z-30 w-full py-2 text-2xl bg-white top-10 sm:top-4">
          <h1 className="flex items-center w-full gap-2 text-2xl font-normal">
            {heading}
          </h1>
        </header>
        {content}
      </section>
      {aside && <aside className="w-5/12">{aside}</aside>}
    </article>
  );
};

export { Article };
