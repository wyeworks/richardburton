import { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import { Publication } from "modules/publications";
import PublicationIndex from "components/PublicationIndex";
import PublicationToolbar from "components/PublicationToolbar";
import Head from "next/head";
import Header from "components/Header";

const Home: NextPage = () => {
  const { data: publications } = useQuery<Publication[]>(
    "publications",
    async () => {
      try {
        const { data } = await API.get("publications");
        return data;
      } catch (error) {
        return error;
      }
    }
  );

  const visibleAttributes = Publication.STORE.ATTRIBUTES.useAllVisible();

  return (
    <>
      <Head>
        <title>Richard Burton</title>
      </Head>
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex justify-center p-4 space-x-8 overflow-hidden">
          <main className="flex overflow-scroll grow">
            {publications ? (
              <PublicationIndex
                entries={publications.map((publication, index) => ({
                  id: index,
                  publication,
                  errors: null,
                }))}
                attributes={visibleAttributes}
              />
            ) : (
              "loading..."
            )}
          </main>
          <aside>
            <PublicationToolbar filter upload />
          </aside>
        </div>
      </div>
    </>
  );
};

export default Home;
