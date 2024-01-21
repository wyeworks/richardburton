import Logo from "assets/logo.svg";
import Head from "next/head";
import Link from "next/link";
import { FC, ReactNode } from "react";

type Props = {
  title: string;
  footer?: ReactNode;
  content: ReactNode;
  subheader?: ReactNode;
  leftAside?: ReactNode;
};

const HEADING_TEXT = "Richard Burton Platform";
const SUBHEADING_TEXT = "A database about Brazilian literature in translation";

const Layout: FC<Props> = ({
  title,
  footer,
  content,
  subheader,
  leftAside,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex flex-col h-full px-8 overflow-x-clip">
        <header className="sticky top-0 z-20 pb-6 bg-gray-100">
          <h1 className="select-none py-1.5 -mx-8 text-center text-white bg-indigo-600 flex items-center justify-center">
            <Link
              href="/"
              className="flex items-center justify-center flex-shrink gap-4 px-2 py-0.5 transition-colors rounded hover:bg-indigo-500 shadow-white"
            >
              <span className="inline-flex items-center gap-3 py-1 text-lg font-medium">
                <Logo className="h-8" />
                {HEADING_TEXT}
              </span>
              <hr className="w-0.5 h-8 bg-current border-none" />
              <div className="inline text-base">{SUBHEADING_TEXT}</div>
            </Link>
          </h1>
          {subheader}
        </header>
        <div className="flex h-full gap-2 overflow-clip">
          {leftAside && <aside>{leftAside}</aside>}
          <main className="relative pb-4 overflow-y-auto overflow-x-clip grow scrollbar-thin scrollbar-thumb-indigo-600">
            {content}
          </main>
        </div>
        <footer className="sticky bottom-0 py-4 bg-gray-100">{footer}</footer>
      </div>
    </>
  );
};

export default Layout;
export { SUBHEADING_TEXT };
