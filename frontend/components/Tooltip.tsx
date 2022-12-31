import classNames from "classnames";
import { FC } from "react";
import TooltipProvider, { TooltipProps } from "./TooltipProvider";

type Props = Omit<TooltipProps, "content"> & {
  message: string;
  error?: boolean;
  warning?: boolean;
  info?: boolean;
};

const Tooltip: FC<Props> = ({
  children,
  message,
  error,
  warning,
  info,
  ...props
}) => {
  const content = (
    <div
      className={classNames(
        "flex items-center py-1 text-sm space-x-1 m-2 rounded shadow",
        {
          "text-white bg-red-500 pl-1 pr-2": error,
          "bg-white pl-1 pr-2 shadow": warning || info,
        }
      )}
    >
      <span
        role="presentation"
        className={classNames("self-start", {
          "text-base": warning || error,
          "text-indigo-700 text-xl mb-0.5": info,
        })}
      >
        {error && "❕"}
        {warning && "⚠️"}
        {info && "ℹ"}
      </span>

      <span>{message}</span>
    </div>
  );

  return Boolean(message) ? (
    <TooltipProvider {...props} content={content}>
      {children}
    </TooltipProvider>
  ) : (
    <>{children}</>
  );
};

export default Tooltip;
