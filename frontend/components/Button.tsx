import c from "classnames";
import { FC, forwardRef, HTMLProps } from "react";

type Props = HTMLProps<HTMLButtonElement> & {
  label: string;
  type?: "primary" | "outline";
  Icon?: FC<{ className: string }>;
  alignment?: "center" | "left";
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    label,
    onClick,
    type = "primary",
    Icon,
    alignment = "center",
    className,
    ...props
  },
  ref
) {
  const isPrimary = type === "primary";
  const isOutline = type === "outline";
  const isTextCentered = alignment === "center";

  return (
    <button
      {...props}
      ref={ref}
      className={c(
        "w-full flex px-2 py-1.5 transition-colors items-center rounded font-base shadow-sm text-xs",
        "disabled:bg-slate-300",
        {
          "text-white bg-indigo-600 hover:bg-indigo-700": isPrimary,
          "bg-gray-100 hover:bg-white/50": isOutline,
          "justify-center": isTextCentered,
        },
        className
      )}
      onClick={onClick}
    >
      {Icon && (
        <Icon className={c("w-5 h-5 mr-2", { "text-indigo-700": isOutline })} />
      )}
      {label}
    </button>
  );
});

export default Button;
