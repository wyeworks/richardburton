import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import c from "classnames";
import MenuProvider from "./MenuProvider";
import ChevronDownIcon from "assets/chevron-down.svg";
import { Key } from "app";

type Props = Omit<HTMLProps<HTMLInputElement>, "value" | "onChange"> & {
  options: string[];
  placeholder: string;
  value: string;
  onChange: (option: string) => void;
};

export default forwardRef<HTMLInputElement, Props>(function Select(
  {
    value,
    options,
    placeholder,
    onChange,
    onFocus,
    onKeyDown,
    onBlur,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false);

    if (!options.includes(inputValue)) {
      setInputValue("");
    }

    onBlur?.(event);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const v = event.target.value;
    setInputValue(v);

    if (v) {
      setIsOpen(true);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const isInputValueBlank = inputValue.trim() === "";

    if (
      (event.key === Key.ENTER || event.key === Key.ARROW_RIGHT) &&
      activeIndex != null
    ) {
      setInputValue(options[activeIndex]);
      setIsOpen(false);
    }

    onKeyDown?.(event);
  }

  function handleToggleClick(_event: MouseEvent<HTMLButtonElement>) {
    setIsOpen((isOpen) => !isOpen);
    inputRef.current?.focus();
  }

  function handleSelect(option: string) {
    setInputValue(option);
    onChange?.(option);
  }

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <MenuProvider
      options={options}
      isOpen={isOpen}
      activeIndex={activeIndex}
      setIsOpen={setIsOpen}
      setActiveIndex={setActiveIndex}
      onSelect={handleSelect}
    >
      <div
        ref={ref}
        className={c(
          "flex items-center px-2 py-1 rounded w-fit ",
          "hover:bg-gray-active hover:shadow-sm",
          {
            "bg-gray-active shadow-sm": focused || isOpen,
          }
        )}
      >
        <input
          {...props}
          ref={inputRef}
          placeholder={placeholder}
          className={c(
            "outline-none bg-transparent placeholder:text-xs text-xs",
            "error:focus:bg-red-400/80 error:bg-red-300/40 error:focus:text-white error:shadow-sm error:placeholder-white"
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          value={inputValue}
        />
        <button
          className={c(
            "outline-none",
            "h-5 aspect-square",
            "flex items-center justify-center",
            "transition-transform",
            { "rotate-180": isOpen }
          )}
          onClick={handleToggleClick}
        >
          <ChevronDownIcon className="h-5" />
        </button>
      </div>
    </MenuProvider>
  );
});
