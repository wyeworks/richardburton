import TrashIcon from "assets/trash.svg";
import { Publication } from "modules/publication";
import { FC } from "react";
import {
  getSelection,
  useClearSelection,
  useSelectionSize,
} from "react-selection-manager";
import Button from "./Button";

const PublicationDelete: FC = () => {
  const setDeleted = Publication.STORE.useSetDeleted();
  const selectionSize = useSelectionSize();
  const clearSelection = useClearSelection();

  const deleteSelected = () => {
    const selectedIds = [...getSelection()] as number[];
    if (selectedIds.length > 0) {
      setDeleted(selectedIds);
      clearSelection();
    }
  };

  return (
    <Button
      label={`Delete ${selectionSize}`}
      variant="danger"
      alignment="left"
      width="fit"
      Icon={TrashIcon}
      onClick={deleteSelected}
    />
  );
};

export default PublicationDelete;
