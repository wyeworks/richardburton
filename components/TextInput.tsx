import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  HTMLProps,
  ReactNode,
  Ref,
  useState,
} from "react";
import c from "classnames";

type Props = Omit<
  HTMLProps<HTMLInputElement>,
  "value" | "onChange" | "className"
> & {
  value: string;
  error?: boolean;
  onChange: (value: string) => void;
  left?: ReactNode;
  right?: ReactNode;

  inputRef?: Ref<HTMLInputElement>;
};

export default forwardRef<HTMLDivElement, Props>(function TextInput(
  { value, error, left, right, inputRef, onChange, onBlur, onFocus, ...props },
  ref
) {
  const [focused, setFocused] = useState(false);

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    onBlur?.(event);
  }
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange?.(event.target.value);
  }

  return (
    <div
      ref={ref}
      className={c(
        "w-full overflow-x-scroll gap-1 inline-flex items-center text-xs rounded h-full scrollbar scrollbar-none",
        "p-1",
        "error:shadow-sm",
        {
          "bg-gray-active shadow-sm error:bg-red-400/80": focused,
          "error:bg-red-300/40": !focused,
        }
      )}
      data-error={error}
    >
      {left}
      <input
        {...props}
        ref={inputRef}
        value={value}
        className="px-1 bg-transparent outline-none shrink grow placeholder:text-xs error:focus:text-white error:placeholder-white"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        data-error={error}
      />
      {right}
    </div>
  );
});
