import RestoreTrashIcon from "assets/restore-trash.svg";
import { Publication } from "modules/publication";
import { FC } from "react";
import { useClearSelection } from "react-selection-manager";
import Button from "./Button";

const ResetDeleted: FC = () => {
  const deletedCount = Publication.STORE.useDeletedCount();
  const resetDeleted = Publication.STORE.useResetDeleted();
  const clearSelection = useClearSelection();

  const reset = () => {
    resetDeleted();
    clearSelection();
  };

  return deletedCount !== 0 ? (
    <Button
      label={`Reset ${deletedCount} deleted`}
      variant="outline"
      Icon={RestoreTrashIcon}
      alignment="left"
      width="fit"
      onClick={reset}
    />
  ) : null;
};

export default ResetDeleted;
