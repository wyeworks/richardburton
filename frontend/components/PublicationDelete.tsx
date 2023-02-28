import { Publication } from "modules/publications";
import { FC } from "react";
import {
  getSelection,
  useClearSelection,
  useSelectionSize,
} from "react-selection-manager";
import Button from "./Button";
import TrashIcon from "assets/trash.svg";

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

  return selectionSize !== 0 ? (
    <Button
      label={`Delete ${selectionSize}`}
      type="secondary"
      alignment="left"
      width="fixed"
      Icon={TrashIcon}
      onClick={deleteSelected}
    />
  ) : null;
};

export default PublicationDelete;
