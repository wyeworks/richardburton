import Head from "next/head";
import { FC, ReactNode } from "react";
import Header from "./Header";

type Props = {
  title: string;

  footer?: ReactNode;
  content: ReactNode;
  subheader?: ReactNode;
};

const Layout: FC<Props> = ({ title, footer, content, subheader }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex justify-center px-8 py-4 space-x-8 overflow-hidden grow">
          <div className="flex space-x-4 overflow-hidden grow">
            <div className="flex flex-col justify-center overflow-hidden grow">
              {subheader && <header className="p-2">{subheader}</header>}
              <main className="relative flex p-2 overflow-hidden grow">
                <div className="flex overflow-scroll grow">{content}</div>
              </main>
            </div>
          </div>
        </div>
        <footer className="px-8 py-4">{footer}</footer>
      </div>
    </>
  );
};

export default Layout;
