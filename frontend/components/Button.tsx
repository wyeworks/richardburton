import classNames from "classnames";
import { FC } from "react";

type Props = {
  label: string;
  onClick: () => void;
  type?: "primary" | "outline";
  Icon?: FC<{ className: string }>;
  alignment?: "center" | "left";
};

const Button: FC<Props> = ({
  label,
  onClick,
  type = "primary",
  Icon,
  alignment = "center",
}) => {
  const isPrimary = type === "primary";
  const isOutline = type === "outline";
  const isTextCentered = alignment === "center";

  return (
    <button
      className={classNames(
        "w-full flex px-2 py-1.5 transition-colors items-center rounded-lg font-base shadow-sm text-sm",
        {
          "text-white bg-indigo-600 hover:bg-indigo-700": isPrimary,
          "bg-gray-100 hover:bg-gray-200": isOutline,
          "justify-center": isTextCentered,
        }
      )}
      onClick={onClick}
    >
      {Icon && <Icon className="w-4 h-4 mr-2 text-white" />}
      {label}
    </button>
  );
};

export default Button;
