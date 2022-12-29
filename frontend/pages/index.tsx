import { NextPage } from "next";
import { API } from "app";
import { Publication } from "modules/publications";
import PublicationIndex from "components/PublicationIndex";
import PublicationToolbar from "components/PublicationToolbar";
import Header from "components/Header";
import Layout from "components/Layout";
import { useEffect } from "react";
import { useNotifyError } from "components/Errors";
import axios from "axios";
import { range } from "lodash";

const Home: NextPage = () => {
  const notifyError = useNotifyError();
  const setPublications = Publication.STORE.useSetAll();

  useEffect(() => {
    API.get<Publication[]>("publications")
      .then(({ data }) => {
        setPublications(
          data.map((publication, index) => ({
            id: index,
            publication,
            errors: null,
          }))
        );
      })
      .catch(({ error }) => {
        if (axios.isAxiosError(error)) {
          const { response, message } = error;
          const descriptiveError =
            response && Publication.describe(response.data as string);

          notifyError(descriptiveError || message);
        }
      });
  }, [notifyError, setPublications]);

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
