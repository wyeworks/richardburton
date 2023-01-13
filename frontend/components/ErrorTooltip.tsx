import { FC } from "react";
import Tooltip, { TooltipProps } from "./Tooltip";

type Props = Omit<TooltipProps, "content"> & {
  message: string;
};

const ErrorTooltip: FC<Props> = ({ children, message, ...props }) => {
  const content = (
    <div
      className={
        "flex items-center pl-1 pr-2 py-1 text-sm space-x-1 text-white bg-red-500 rounded shadow-md"
      }
    >
      <span role="presentation" className="text-base">
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
