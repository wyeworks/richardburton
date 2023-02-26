import Head from "next/head";
import { FC, ReactNode } from "react";

type Props = {
  title: string;
  header: ReactNode;
  footer?: ReactNode;
  content: ReactNode;
  sidebar?: ReactNode;
  subheader?: ReactNode;
};

const Layout: FC<Props> = ({
  title,
  header,
  footer,
  content,
  sidebar,
  subheader,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex flex-col h-full">
        {header}
        <div className="flex justify-center px-8 py-4 space-x-8 overflow-hidden grow">
          <div className="flex space-x-4 overflow-hidden grow">
            <div className="flex flex-col justify-center overflow-hidden grow">
              {subheader && <header className="p-2">{subheader}</header>}
              <main className="relative flex p-2 overflow-hidden grow">
                <div className="flex overflow-scroll grow">{content}</div>
              </main>
            </div>
          </div>
          {sidebar && <aside className="w-48 p-2 space-y-2">{sidebar}</aside>}
        </div>
        <footer className="px-8 py-4">{footer}</footer>
      </div>
    </>
  );
};

export default Layout;
