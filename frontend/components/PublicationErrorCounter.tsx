import ErrorCircleIcon from "assets/error-circle.svg";
import { toString } from "lodash";
import { Publication } from "modules/publication";
import { FC } from "react";
import { useRecoilCallback } from "recoil";
import Button from "./Button";
import Tooltip from "./Tooltip";

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
        const focusedId = getFocusedRowId() ?? -1;

        if (visibleIds) {
          const nextInvalidId =
            visibleIds?.find((id) => id > focusedId && !isValid(id)) ||
            visibleIds?.find((id) => !isValid(id));

          setFocusedRowId(nextInvalidId);
        }
      },
    [],
  );

  return invalidPublicationCount !== 0 ? (
    <Tooltip
      error
      message={`${invalidPublicationCount} ${
        publicationCount === 1 ? "publication" : "publications"
      } with errors`}
    >
      <Button
        variant="danger"
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
