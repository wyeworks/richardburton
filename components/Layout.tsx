import Head from "next/head";
import { FC, ReactNode } from "react";

type Props = {
  title: string;
  header: ReactNode;
  content: ReactNode;
  sidebar: ReactNode;
};

const Layout: FC<Props> = ({ title, header, content, sidebar }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex flex-col h-full">
        {header}
        <div className="flex justify-center p-4 space-x-8 overflow-hidden">
          <main className="flex overflow-scroll grow">{content}</main>
          <aside>{sidebar}</aside>
        </div>
      </div>
    </>
  );
};

export default Layout;
