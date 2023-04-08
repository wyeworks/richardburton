import { Publication } from "modules/publication";
import { FC } from "react";
import Button from "./Button";
import RestorePageIcon from "assets/restore-page.svg";
import { useClearSelection } from "react-selection-manager";

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
      type="outline"
      Icon={RestorePageIcon}
      alignment="left"
      width="fixed"
      onClick={reset}
    />
  ) : null;
};

export default ResetOverridden;
