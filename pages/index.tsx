import type { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import {
  FlatPublication,
  PUBLICATION_ATTRIBUTES,
  PUBLICATION_ATTRIBUTE_LABELS,
  TranslatedBook,
} from "types";
import PublicationIndex from "components/PublicationIndex";
import {
  autoUpdate,
  offset,
  useFloating,
} from "@floating-ui/react-dom-interactions";
import Toggle from "components/Toggle";
import Head from "next/head";

const toFlatPublication = (book: TranslatedBook): FlatPublication => {
  const [firstPublication] = book.publications;

  return {
    originalTitle: book.originalBook.title,
    originalAuthors: book.originalBook.authors,
    authors: book.authors,
    title: firstPublication.title,
    year: firstPublication.year,
    country: firstPublication.country,
    publisher: firstPublication.publisher,
  };
};

const toFlatPublications = (books: TranslatedBook[]): FlatPublication[] => {
  return books.map(toFlatPublication);
};

const Home: NextPage = () => {
  const { data: translatedBooks } = useQuery<TranslatedBook[]>(
    "translated-books",
    async () => {
      try {
        const { data } = await API.get("/books/translated");
        return data;
      } catch (error) {
        return error;
      }
    }
  );

  const { reference, floating, x, y, strategy } = useFloating({
    placement: "right-start",
    middleware: [offset(20)],
    whileElementsMounted: autoUpdate,
  });

  return (
    <>
      <Head>
        <title>Richard Burton</title>
      </Head>
      <div className="grid h-full p-8 mx-auto overflow-y-scroll gap-y-8 max-w-7xl">
        <header className="space-y-2 text-center">
          <h1 className="text-5xl">Richard Burton Platform</h1>
          <h2 className="text-2xl">
            A database about Brazilian literature in translation
          </h2>
        </header>

        <aside
          ref={floating}
          style={{ top: y ?? 0, left: x ?? 0, position: strategy }}
          className="p-2 space-y-2 rounded"
        >
          {PUBLICATION_ATTRIBUTES.map((attribute) => (
            <Toggle label={PUBLICATION_ATTRIBUTE_LABELS[attribute]} />
          ))}
        </aside>
        <main ref={reference} className="overflow-scroll">
          {translatedBooks ? (
            <PublicationIndex
              entries={toFlatPublications(translatedBooks)}
              columns={PUBLICATION_ATTRIBUTES}
            />
          ) : (
            "loading..."
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
