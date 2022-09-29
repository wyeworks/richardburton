import type { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import { TranslatedBook } from "types";
import TranslatedBookIndex from "components/TranslatedBookIndex";

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

  return (
    <div className="flex flex-col h-full p-8 mx-auto space-y-10 overflow-hidden max-w-7xl">
      <header className="space-y-2 text-center">
        <h1 className="text-5xl">Richard Burton Platform</h1>
        <h2 className="text-2xl">
          A database about Brazilian literature in translation
        </h2>
      </header>
      <main className="overflow-y-scroll">
        {translatedBooks ? (
          <TranslatedBookIndex entries={translatedBooks} />
        ) : (
          "loading..."
        )}
      </main>
    </div>
  );
};

export default Home;
