import { SUBHEADING_TEXT } from "components/Layout";
import { DocumentProps, Head, Html, Main, NextScript } from "next/document";
import { FC } from "react";

const DESCRIPTION = SUBHEADING_TEXT;
const KEYWORDS = "Brazilian, Literature, Richard Burton, Translation, English";

const Document: FC<DocumentProps> = () => {
  return (
    <Html className="h-screen">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="description" content={SUBHEADING_TEXT} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Andrés Vidal" />
        <meta name="keywords" content={KEYWORDS} />
        <meta property="og:title" content="Richard Burton Platform" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Richard Burton Platform" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/thumbnail.svg" />
        <meta property="og:type" content="website" />
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
