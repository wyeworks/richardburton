import type { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import {
  FlatPublication,
  FlatPublicationKey,
  PUBLICATION_ATTRIBUTES,
  PUBLICATION_ATTRIBUTE_LABELS,
  TranslatedBook,
} from "types";
import PublicationIndex from "components/PublicationIndex";
import {
  autoUpdate,
  flip,
  offset,
  useFloating,
} from "@floating-ui/react-dom-interactions";
import Toggle from "components/Toggle";
import Head from "next/head";
import { useState } from "react";

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

const DEFAULT_COLUMNS: FlatPublicationKey[] = [
  "originalTitle",
  "title",
  "authors",
  "year",
];

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
    middleware: [offset(20), flip()],
    whileElementsMounted: autoUpdate,
  });

  const [columns, setColumns] = useState(new Set(DEFAULT_COLUMNS));

  return (
    <>
      <Head>
        <title>Richard Burton</title>
      </Head>
      <div className="flex flex-col h-full p-8 overflow-hidden gap-y-8 2xl:mx-auto max-w-7xl pr-52">
        <header className="space-y-2 text-center ">
          <h1 className="text-5xl">Richard Burton Platform</h1>
          <h2 className="text-2xl">
            A database about Brazilian literature in translation
          </h2>
        </header>

        <aside
          ref={floating}
          style={{ top: y ?? 0, left: x ?? 0, position: strategy }}
          className="w-48 p-2 space-y-2 rounded"
        >
          {PUBLICATION_ATTRIBUTES.map((attribute) => {
            const isActive = columns.has(attribute);
            const newColumns = new Set(columns);

            if (isActive) {
              newColumns.delete(attribute);
            } else {
              newColumns.add(attribute);
            }

            return (
              <Toggle
                key={attribute}
                label={PUBLICATION_ATTRIBUTE_LABELS[attribute]}
                startsChecked={isActive}
                onChange={() => setColumns(newColumns)}
              />
            );
          })}
        </aside>
        <main ref={reference} className="w-full overflow-scroll">
          {translatedBooks ? (
            <PublicationIndex
              entries={toFlatPublications(translatedBooks)}
              columns={columns}
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
