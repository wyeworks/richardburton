import {
  DetailedHTMLProps,
  forwardRef,
  LiHTMLAttributes,
  MouseEventHandler,
} from "react";
import c from "classnames";

type Props = Omit<
  DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>,
  "className" | "onClick"
> & {
  selected: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default forwardRef<HTMLLIElement, Props>(function MenuItem(
  { selected, children, onClick, ...props },
  ref,
) {
  return (
    <li
      {...props}
      className={c("focus:bg-indigo-100", { "bg-indigo-100": selected })}
      ref={ref}
    >
      <button className="px-2.5 py-1 w-full text-left" onClick={onClick}>
        {children}
      </button>
    </li>
  );
});
