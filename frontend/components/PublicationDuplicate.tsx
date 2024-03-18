import CopyIcon from "assets/copy.svg";
import { Publication } from "modules/publication";
import { FC } from "react";
import {
  getSelection,
  useClearSelection,
  useSelectionSize,
} from "react-selection-manager";
import Button from "./Button";

const PublicationDuplicate: FC = () => {
  const duplicate = Publication.STORE.useDuplicate();
  const validate = Publication.REMOTE.useValidate();
  const selectionSize = useSelectionSize();
  const clearSelection = useClearSelection();

  const duplicateSelected = () => {
    const selectedIds = getSelection() as Set<number>;
    if (selectedIds.size > 0) {
      const newIds = duplicate(selectedIds);
      validate(newIds);
      clearSelection();
    }
  };

  return (
    <Button
      label={`Duplicate ${selectionSize}`}
      variant="secondary"
      alignment="left"
      width="fit"
      Icon={CopyIcon}
      onClick={duplicateSelected}
    />
  );
};

export default PublicationDuplicate;
