import { NextPage } from "next";
import { Publication } from "modules/publications";
import PublicationToolbar from "components/PublicationToolbar";
import Header from "components/Header";
import Layout from "components/Layout";
import { useEffect } from "react";
import PublicationIndex from "components/PublicationIndex";

const Home: NextPage = () => {
  const index = Publication.REMOTE.useIndex();

  useEffect(() => {
    index();
  }, [index]);

  return (
    <Layout
      title="Richard Burton"
      header={<Header />}
      sidebar={<PublicationToolbar filter upload />}
      content={<PublicationIndex />}
    />
  );
};

export default Home;
