import { FC } from "react";
import CheckIcon from "assets/check.svg";
import Button from "./Button";

type Props = {
  label: string;
  checked: boolean;
  onClick: () => void;
};

const Toggle: FC<Props> = ({ label, checked, onClick }) => {
  return (
    <Button
      type={checked ? "primary" : "outline"}
      Icon={checked ? CheckIcon : undefined}
      label={label}
      onClick={onClick}
      alignment="left"
    />
  );
};

export default Toggle;
