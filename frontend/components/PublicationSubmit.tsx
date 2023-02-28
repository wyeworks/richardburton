import { Publication } from "modules/publications";
import { FC, useCallback } from "react";
import Button from "./Button";
import { useNotify } from "./Notifications";
import Tooltip from "./Tooltip";

const PublicationSubmit: FC = () => {
  const bulk = Publication.REMOTE.useBulk();
  const setAll = Publication.STORE.useSetAll();
  const notify = useNotify();

  const handleSubmit = useCallback(() => {
    bulk().then((publications) => {
      setAll([]);
      notify({
        message: `${publications.length} ${
          publications.length === 1 ? "publication" : "publications"
        } inserted successfully`,
        level: "success",
      });
    });
  }, [bulk, notify, setAll]);

  const publicationCount = Publication.STORE.useVisibleCount();
  const validPublicationCount = Publication.STORE.useValidCount();
  const invalidPublicationCount = publicationCount - validPublicationCount;

  const isValidating = Publication.STORE.useIsValidating();

  const isSubmitDisabled =
    isValidating || publicationCount === 0 || invalidPublicationCount > 0;

  return (
    <Tooltip
      info
      message="Save the publications to the repository"
      placement="top"
    >
      <Button
        label="Submit"
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        width="fixed"
      />
    </Tooltip>
  );
};

export default PublicationSubmit;
