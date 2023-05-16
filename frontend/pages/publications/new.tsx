import { NextPage } from "next";
import { Publication } from "modules/publication";
import PublicationReview from "components/PublicationReview";

import Layout from "components/Layout";
import { useEffect } from "react";
import PublicationUpload from "components/PublicationUpload";
import PublicationSubmit from "components/PublicationSubmit";
import ResetDeleted from "components/ResetDeleted";
import ResetOverridden from "components/ResetOverridden";
import PublicationDelete from "components/PublicationDelete";
import StrikeHeading from "components/StrikeHeading";
import PublicationErrorCounter from "components/PublicationErrorCounter";
import PublicationCounter from "components/PublicationCounter";
import RowIdToggle from "components/RowIdToggle";
import PublicationDuplicate from "components/PublicationDuplicate";
import { useIsSelectionEmpty } from "react-selection-manager";
import PublicationDeselect from "components/PublicationDeselect";

const NewPublications: NextPage = () => {
  const setAll = Publication.STORE.useSetAll();
  const setVisible = Publication.STORE.ATTRIBUTES.useSetVisible();
  const resetAll = Publication.STORE.useResetAll();
  const isSelectionEmpty = useIsSelectionEmpty();

  useEffect(() => setAll([]), [setAll]);
  useEffect(() => setVisible(Publication.ATTRIBUTES), [setVisible, setAll]);
  useEffect(() => resetAll, [resetAll]);

  return (
    <Layout
      title="Richard Burton"
      subheader={
        <StrikeHeading label="Prepare new publications to be inserted in the database" />
      }
      content={<PublicationReview />}
      footer={
        <div className="flex space-x-2">
          {isSelectionEmpty ? (
            <>
              <PublicationUpload />
              <PublicationCounter />
              <PublicationErrorCounter />
              <ResetOverridden />
              <ResetDeleted />
              <RowIdToggle />
              <PublicationSubmit />
            </>
          ) : (
            <>
              <PublicationDeselect />
              <PublicationDuplicate />
              <PublicationDelete />
            </>
          )}
        </div>
      }
    />
  );
};

export default NewPublications;
