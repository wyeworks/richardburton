import c from "classnames";
import { FC, forwardRef, HTMLProps } from "react";

type Props = HTMLProps<HTMLButtonElement> & {
  label: string;
  type?: "primary" | "secondary" | "outline" | "danger";
  Icon?: FC<{ className: string }>;
  alignment?: "center" | "left";
  width?: "full" | "fixed" | "fit";
  labelSrOnly?: boolean;
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    label,
    onClick,
    type = "primary",
    Icon,
    alignment = "center",
    width = "full",
    labelSrOnly,
    ...props
  },
  ref
) {
  const isPrimary = type === "primary";
  const isSecondary = type === "secondary";
  const isOutline = type === "outline";
  const isDanger = type === "danger";
  const isTextCentered = alignment === "center";
  const isFixedWidth = width === "fixed";
  const isFullWidth = width === "full";
  const isFitWidth = width === "fit";

  return (
    <button
      {...props}
      ref={ref}
      className={c(
        "flex py-1.5 px-2 transition-colors items-center rounded font-base shadow-sm text-xs group space-x-2",
        "disabled:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-gray-100",
        {
          "text-white bg-indigo-600 hover:bg-indigo-700": isPrimary,
          "text-white bg-yellow-500 hover:bg-yellow-600": isSecondary,
          "bg-gray-100 hover:bg-gray-active": isOutline,
          "text-white bg-red-500 hover:bg-red-600": isDanger,
          "justify-center": isTextCentered,
          "w-full": isFullWidth,
          "w-48": isFixedWidth,
          "w-fit": isFitWidth,
        }
      )}
      onClick={onClick}
    >
      {Icon && (
        <Icon
          className={c("w-4 h-4 group-disabled:text-gray-300", {
            "text-indigo-700": isOutline,
            "-ml-0.5": !labelSrOnly,
          })}
        />
      )}
      <span className={c({ "sr-only": labelSrOnly })}>{label}</span>
    </button>
  );
});

export type { Props as ButtonProps };

export default Button;
