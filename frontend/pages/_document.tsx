import { FILES_URL } from "app";
import { SUBHEADING_TEXT } from "components/Layout";
import { DocumentProps, Head, Html, Main, NextScript } from "next/document";
import { FC } from "react";

const Document: FC<DocumentProps> = () => {
  return (
    <Html className="h-screen">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="description" content={SUBHEADING_TEXT} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Andrés Vidal" />
        <meta
          name="keywords"
          content="Brazilian, Literature, Richard Burton, Translation, English"
        />
        <meta property="og:image" content={`${FILES_URL}/thumbnail.svg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="627" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
