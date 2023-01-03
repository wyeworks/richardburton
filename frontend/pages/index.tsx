import { NextPage } from "next";
import { useQuery } from "react-query";
import { API } from "app";
import { Publication } from "modules/publications";
import PublicationIndex from "components/PublicationIndex";
import PublicationToolbar from "components/PublicationToolbar";
import Header from "components/Header";
import Layout from "components/Layout";

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
    <Layout
      title="Richard Burton"
      header={<Header />}
      sidebar={<PublicationToolbar filter upload />}
      content={
        publications ? (
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
        )
      }
    />
  );
};

export default Home;
