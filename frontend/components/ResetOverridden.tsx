import RestorePageIcon from "assets/restore-page.svg";
import { Publication } from "modules/publication";
import { FC } from "react";
import { useClearSelection } from "react-selection-manager";
import Button from "./Button";

const ResetOverridden: FC = () => {
  const overriddenCount = Publication.STORE.useOverriddenCount();
  const resetOverridden = Publication.STORE.useResetOverridden();
  const clearSelection = useClearSelection();

  const overriddenIds = Publication.STORE.useOverriddenIds();
  const validate = Publication.REMOTE.useValidate();

  const reset = () => {
    if (!overriddenIds)
      throw "Can not reset publications: overriden ids are undefined.";
    resetOverridden();
    clearSelection();
    validate(overriddenIds);
  };

  return overriddenCount !== 0 ? (
    <Button
      label={`Reset ${overriddenCount} overriden`}
      variant="outline"
      Icon={RestorePageIcon}
      alignment="left"
      width="fit"
      onClick={reset}
    />
  ) : null;
};

export default ResetOverridden;
