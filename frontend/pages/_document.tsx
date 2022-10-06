import { DocumentProps, Html, Head, Main, NextScript } from "next/document";
import { FC } from "react";

const Document: FC<DocumentProps> = () => {
  return (
    <Html className="h-screen">
      <Head />
      <body className="h-screen font-light text-gray-900 bg-gray-100 font-montserrat">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
