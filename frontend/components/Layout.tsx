import Head from "next/head";
import { FC, ReactNode } from "react";
import UserToolbar from "./UserToolbar";

type Props = {
  title: string;
  header: ReactNode;
  content: ReactNode;
  sidebar?: ReactNode;
  subheader?: ReactNode;
};

const Layout: FC<Props> = ({ title, header, content, sidebar, subheader }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex flex-col h-full">
        {header}
        <div className="flex justify-center p-4 space-x-8 overflow-hidden grow">
          <div className="flex p-4 space-x-4 overflow-hidden grow">
            <div className="flex flex-col justify-center space-y-4 overflow-hidden grow">
              {subheader && <header className="p-2">{subheader}</header>}
              <main className="relative flex p-2 overflow-hidden grow">
                <div className="flex overflow-scroll grow">{content}</div>
              </main>
            </div>
          </div>
          {sidebar && (
            <aside className="w-48 p-2 space-y-2">
              {sidebar}
              <UserToolbar />
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

export default Layout;
