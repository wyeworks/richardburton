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
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export default forwardRef<HTMLLIElement, Props>(function MenuItem(
  { selected, children, onClick, ...props },
  ref
) {
  return (
    <li
      className={c("px-2.5 py-1 focus:bg-indigo-100", {
        "bg-indigo-100": selected,
      })}
      ref={ref}
      {...props}
    >
      <button className="w-full text-left" onClick={onClick}>
        {children}
      </button>
    </li>
  );
});
