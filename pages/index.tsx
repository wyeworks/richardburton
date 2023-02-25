import { NextPage } from "next";
import { useEffect } from "react";
import { Publication } from "modules/publications";
import Header from "components/Header";
import Layout from "components/Layout";
import PublicationToolbar from "components/PublicationToolbar";
import PublicationIndex from "components/PublicationIndex";
import PublicationSearch from "components/PublicationSearch";
import { useRouter } from "next/router";
import { isString } from "lodash";
import PublicationFilter from "components/PublicationFilter";

const Home: NextPage = () => {
  const index = Publication.REMOTE.useIndex();
  const reset = Publication.STORE.useResetAll();
  const router = useRouter();

  useEffect(() => reset(), [reset]);

  useEffect(() => {
    const { search } = router.query;
    if (router.isReady) {
      index({ search: isString(search) ? search : undefined });
    }
  }, [reset, index, router]);

  return (
    <Layout
      title="Richard Burton"
      header={<Header />}
      //sidebar={<PublicationToolbar filter nav download />}
      content={<PublicationIndex />}
      subheader={
        <div className="space-y-2">
          <PublicationFilter />
          <PublicationSearch />
        </div>
      }
    />
  );
};

export default Home;
