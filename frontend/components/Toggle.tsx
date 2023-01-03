import { FC, useState } from "react";
import classNames from "classnames";
import CheckIcon from "assets/check.svg";
import Button from "./Button";

type Props = { label: string; startsChecked: boolean; onChange: () => void };

const Toggle: FC<Props> = ({ label, startsChecked, onChange }) => {
  const [isChecked, setIsChecked] = useState(startsChecked);

  const handleClick = () => {
    setIsChecked((isChecked) => !isChecked);
    onChange();
  };

  return (
    <Button
      type={isChecked ? "primary" : "outline"}
      Icon={isChecked ? CheckIcon : undefined}
      label={label}
      onClick={handleClick}
      alignment="left"
    />
  );
};

export default Toggle;
