import { NextPage } from "next";
import { Publication } from "modules/publications";
import PublicationIndex from "components/PublicationIndex";

import PublicationToolbar from "components/PublicationToolbar";
import Header from "components/Header";
import Layout from "components/Layout";

const NewPublications: NextPage = () => {
  const entries = Publication.STORE.useAll();
  const entriesWithErrors = entries?.filter(({ errors }) => errors);
  const entriesWithErrorsCount = entriesWithErrors?.length || 0;

  return (
    <Layout
      title="Richard Burton"
      header={
        <Header compact>
          <h2 className="my-4 text-4xl text-center">
            <div>{entries?.length} publications about to be inserted...</div>
            {entriesWithErrorsCount > 0 && (
              <div className="text-lg text-red-500">
                {entriesWithErrorsCount} of those have errors
              </div>
            )}
          </h2>
        </Header>
      }
      sidebar={<PublicationToolbar edit />}
      content={
        <PublicationIndex
          entries={entries}
          attributes={Publication.ATTRIBUTES}
          editable
        />
      }
    />
  );
};

export default NewPublications;
