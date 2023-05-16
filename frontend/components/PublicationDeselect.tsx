import { FC } from "react";
import DeselectIcon from "assets/deselect.svg";
import { useSelectionSize, useClearSelection } from "react-selection-manager";
import Button from "./Button";

const PublicationDeselect: FC = () => {
  const selectionSize = useSelectionSize();
  const clearSelection = useClearSelection();

  return (
    <Button
      type="outline"
      width="fit"
      label={`Deselect ${selectionSize}`}
      Icon={DeselectIcon}
      onClick={clearSelection}
    />
  );
};

export default PublicationDeselect;
