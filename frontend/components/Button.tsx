import c from "classnames";
import { isFunction } from "lodash";
import { FC, forwardRef, HTMLProps, ReactNode } from "react";

type Props = HTMLProps<HTMLButtonElement> & {
  label: string;
  variant?: "primary" | "secondary" | "outline" | "danger";
  Icon?: FC<{ className: string }> | ReactNode;
  alignment?: "center" | "left";
  width?: "full" | "fixed" | "fit";
  labelSrOnly?: boolean;
  type?: "button" | "submit" | "reset";
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    label,
    onClick,
    variant = "primary",
    Icon,
    alignment = "center",
    width = "full",
    type = "button",
    labelSrOnly,
    ...props
  },
  ref,
) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  const isTextCentered = alignment === "center";
  const isFixedWidth = width === "fixed";
  const isFullWidth = width === "full";
  const isFitWidth = width === "fit";

  return (
    <button
      {...props}
      ref={ref}
      className={c(
        "flex py-1.5 px-2 transition-colors items-center rounded font-base shadow-sm text-xs group space-x-2 whitespace-nowrap",
        "disabled:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-gray-100",
        {
          "text-white bg-indigo-600 hover:bg-indigo-700": isPrimary,
          "text-white bg-yellow-500 hover:bg-yellow-600": isSecondary,
          "text-gray-700 bg-gray-100 hover:bg-gray-active": isOutline,
          "text-white bg-red-500 hover:bg-red-600": isDanger,
          "justify-center": isTextCentered,
          "w-full": isFullWidth,
          "w-36": isFixedWidth,
          "w-fit": isFitWidth,
        },
      )}
      onClick={onClick}
      type={type}
    >
      {Icon && isFunction(Icon) ? (
        <Icon
          className={c("w-4 h-4 group-disabled:text-gray-300", {
            "text-indigo-700": isOutline,
            "-ml-0.5": !labelSrOnly,
          })}
        />
      ) : (
        Icon
      )}
      <span className={c({ "sr-only": labelSrOnly })}>{label}</span>
    </button>
  );
});

export type { Props as ButtonProps };

export default Button;
