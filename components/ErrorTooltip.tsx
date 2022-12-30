import classNames from "classnames";
import { FC } from "react";
import Tooltip, { TooltipProps } from "./Tooltip";

type Props = Omit<TooltipProps, "content"> & {
  message: string;
  hidden: boolean;
};

const ErrorTooltip: FC<Props> = ({ children, message, hidden, ...props }) => {
  const content = (
    <div
      className={classNames(
        "flex items-center pl-2 pr-3 py-1.5 space-x-1 text-white bg-red-500 rounded shadow-md",
        { hidden }
      )}
    >
      <span role="presentation" className="text-xl">
        ❕
      </span>
      <span>{message}</span>
    </div>
  );

  return (
    <Tooltip {...props} content={content}>
      {children}
    </Tooltip>
  );
};

export default ErrorTooltip;
