import { FC, useState } from "react";
import classNames from "classnames";
import CheckIcon from "assets/check.svg";

type Props = { label: string; startsChecked: boolean; onChange: () => void };

const Toggle: FC<Props> = ({ label, startsChecked, onChange }) => {
  const [isChecked, setIsChecked] = useState(startsChecked);

  const handleClick = () => {
    setIsChecked((isChecked) => !isChecked);
    onChange();
  };

  return (
    <button
      className={classNames(
        "flex px-2 py-1 transition-colors rounded-lg font-base shadow-sm w-full text-left",
        isChecked
          ? "bg-blue-500 hover:bg-blue-600 text-white"
          : "bg-gray-100 hover:bg-gray-200"
      )}
      onClick={handleClick}
    >
      {isChecked && <CheckIcon className="w-6 h-6 mr-2 text-white" />}
      {label}
    </button>
  );
};

export default Toggle;