import { Publication } from "modules/publication";
import { FC } from "react";
import ErrorCircleIcon from "assets/error-circle.svg";
import Tooltip from "./Tooltip";
import Button from "./Button";
import { toString } from "lodash";
import { useRecoilCallback } from "recoil";

const PublicationErrorCounter: FC = () => {
  const publicationCount = Publication.STORE.useVisibleCount();
  const validPublicationCount = Publication.STORE.useValidCount();
  const invalidPublicationCount = publicationCount - validPublicationCount;

  const focusNextInvalidRow = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const { from } = Publication.STORE;
        const { setFocusedRowId } = Publication.STORE.with({ set });
        const { getVisibleIds, isValid, getFocusedRowId } = from(snapshot);

        const visibleIds = getVisibleIds();
        const focusedId = getFocusedRowId() || -1;

        if (visibleIds) {
          const nextInvalidId =
            visibleIds?.find((id) => id > focusedId && !isValid(id)) ||
            visibleIds?.find((id) => !isValid(id));

          setFocusedRowId(nextInvalidId);
        }
      },
    []
  );

  return invalidPublicationCount !== 0 ? (
    <Tooltip
      error
      message={`${invalidPublicationCount} ${
        publicationCount === 1 ? "publication" : "publications"
      } with errors`}
    >
      <Button
        type="danger"
        width="fit"
        Icon={ErrorCircleIcon}
        label={toString(invalidPublicationCount)}
        aria-label={`${invalidPublicationCount} invalid publications`}
        onClick={focusNextInvalidRow}
      />
    </Tooltip>
  ) : null;
};

export default PublicationErrorCounter;
