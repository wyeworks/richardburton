import Head from "next/head";
import Link from "next/link";
import { FC, ReactNode } from "react";

type Props = {
  title: string;
  footer?: ReactNode;
  content: ReactNode;
  subheader?: ReactNode;
};

const HEADING_TEXT = "Richard Burton Platform";
const SUBHEADING_TEXT = "A database about Brazilian literature in translation";

const Layout: FC<Props> = ({ title, footer, content, subheader }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex flex-col h-full px-8 overflow-x-hidden">
        <header className="sticky top-0 z-20 pb-6 bg-gray-100">
          <h1 className="py-1 -mx-8 text-center text-white bg-indigo-600">
            <div className="inline px-4 py-1 text-lg font-medium border-r">
              <Link href="/">{HEADING_TEXT}</Link>
            </div>
            <div className="inline px-4 text-base">{SUBHEADING_TEXT}</div>
          </h1>
          {subheader}
        </header>
        <main className="relative overflow-x-scroll grow">{content}</main>
        <footer className="sticky bottom-0 py-4 bg-gray-100">{footer}</footer>
      </div>
    </>
  );
};

export default Layout;