import classNames from "classnames";
import { FC } from "react";
import Tooltip, { TooltipProps } from "./Tooltip";

type Props = Omit<TooltipProps, "content"> & {
  message: string;
};

const ErrorTooltip: FC<Props> = ({ children, message, ...props }) => {
  const content = (
    <div
      className={
        "flex items-center pl-2 pr-3 py-1.5 space-x-1 text-white bg-red-500 rounded shadow-md"
      }
    >
      <span role="presentation" className="text-xl">
        ❕
      </span>
      <span>{message}</span>
    </div>
  );

  return Boolean(message) ? (
    <Tooltip {...props} content={content}>
      {children}
    </Tooltip>
  ) : (
    <>{children}</>
  );
};

export default ErrorTooltip;
