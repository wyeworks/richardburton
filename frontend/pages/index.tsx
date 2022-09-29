import type { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import { TranslatedBook } from "types";
import TranslatedBookIndex from "components/TranslatedBookIndex";
import {
  autoUpdate,
  offset,
  useFloating,
} from "@floating-ui/react-dom-interactions";
import Toggle from "components/Toggle";

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
          className="w-48 p-2 space-y-2 rounded"
        >
          <Toggle label="Original title" />
          <Toggle label="Original authors" />
          <Toggle label="Translators" />
          <Toggle label="Title" />
          <Toggle label="Year" />
          <Toggle label="Country" />
          <Toggle label="Publisher" />
        </aside>
        <main ref={reference} className="overflow-scroll">
          {translatedBooks ? (
            <TranslatedBookIndex entries={translatedBooks} />
          ) : (
            "loading..."
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
