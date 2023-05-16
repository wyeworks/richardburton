import { FC } from "react";
import DeselectIcon from "assets/deselect.svg";
import Tooltip from "./Tooltip";
import { useSelectionSize, useClearSelection } from "react-selection-manager";
import Button from "./Button";

const PublicationDeselect: FC = () => {
  const selectionSize = useSelectionSize();
  const clearSelection = useClearSelection();

  const message = `${selectionSize} ${
    selectionSize === 1 ? "publication" : "publications"
  } selected`;

  return (
    <Tooltip info message={message}>
      <Button
        type="outline"
        width="fit"
        label={`Deselect ${selectionSize}`}
        Icon={DeselectIcon}
        onClick={clearSelection}
      />
    </Tooltip>
  );
};

export default PublicationDeselect;
