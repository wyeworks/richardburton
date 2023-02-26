import classNames from "classnames";
import { FC, forwardRef, HTMLProps } from "react";

type Props = HTMLProps<HTMLButtonElement> & {
  label: string;
  type?: "primary" | "outline";
  Icon?: FC<{ className: string }>;
  alignment?: "center" | "left";
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { label, onClick, type = "primary", Icon, alignment = "center", ...props },
  ref
) {
  const isPrimary = type === "primary";
  const isOutline = type === "outline";
  const isTextCentered = alignment === "center";

  return (
    <button
      {...props}
      ref={ref}
      className={classNames(
        "w-full flex px-2 py-1.5 transition-colors items-center rounded font-base shadow-sm text-xs",
        "disabled:bg-slate-300",
        {
          "text-white bg-indigo-600 hover:bg-indigo-700": isPrimary,
          "bg-gray-100 hover:bg-white/50": isOutline,
          "justify-center": isTextCentered,
        }
      )}
      onClick={onClick}
    >
      {Icon && <Icon className="w-4 h-4 mr-2 text-white" />}
      {label}
    </button>
  );
});

export default Button;
