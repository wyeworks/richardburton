import { DocumentProps, Head, Html, Main, NextScript } from "next/document";
import { FC } from "react";

const IMAGE_ALT =
  "Richard Burton Platform: A database about Brazilian literature in translation";
const DESCRIPTION =
  "The Richard Burton Platform is an open access online repository with reliable data about Brazilian literature in translation to English, stemmed from the need to preserve the Brazilian cultural and historical heritage as well as its international dissemination.";

const KEYWORDS = "Brazilian, Literature, Richard Burton, Translation, English";

const Document: FC<DocumentProps> = () => {
  return (
    <Html className="h-screen">
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="description" content={DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Andrés Vidal" />
        <meta name="keywords" content={KEYWORDS} />
        <meta property="og:title" content="Richard Burton Platform" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="Richard Burton Platform" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/thumbnail.png" />
        <meta property="og:image:alt" content={IMAGE_ALT} />
        <meta property="og:type" content="website" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="627" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image:alt" content={IMAGE_ALT} />
        <meta name="twitter:title" content="Richard Burton Platform" />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="/thumbnail.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
