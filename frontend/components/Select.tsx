import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import c from "classnames";
import MenuProvider, { MenuOption } from "./MenuProvider";
import ChevronDownIcon from "assets/chevron-down.svg";
import { Key } from "app";
import TextInput from "./TextInput";

type Option = MenuOption;

type Props = Omit<
  HTMLProps<HTMLInputElement>,
  "value" | "onChange" | "className"
> & {
  options: Option[];
  value: string;
  error: boolean;
  onChange: (option: Option) => void;
};

export default forwardRef<HTMLInputElement, Props>(function Select(
  { value, error, options, onChange, onFocus, onKeyDown, onBlur, ...props },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    setSearch("");
    onBlur?.(event);
  }

  function handleInputChange(v: string) {
    setSearch(v);

    if (v) {
      setIsOpen(true);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (
      (event.key === Key.ENTER || event.key === Key.ARROW_RIGHT) &&
      activeIndex != null
    ) {
      setIsOpen(false);
    }

    onKeyDown?.(event);
  }

  function handleToggleClick(_event: MouseEvent<HTMLButtonElement>) {
    setIsOpen((isOpen) => !isOpen);
    inputRef.current?.focus();
  }

  function handleSelect(option: Option) {
    onChange?.(option);
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    const matches = (opt: Option) =>
      opt.label.toLowerCase().startsWith(search.toLowerCase());

    return search ? options.filter(matches) : options;
  }, [options, search]);

  return (
    <MenuProvider
      options={filteredOptions}
      isOpen={isOpen}
      activeIndex={activeIndex}
      setIsOpen={setIsOpen}
      setActiveIndex={setActiveIndex}
      onSelect={handleSelect}
    >
      <TextInput
        {...props}
        ref={ref}
        inputRef={inputRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        value={focused ? search : value || ""}
        error={error}
        aria-autocomplete="list"
        right={
          <button
            className={c(
              "outline-none",
              "h-5 aspect-square",
              "flex items-center justify-center",
              "transition-transform",
              "error:text-white",
              { "rotate-180": isOpen }
            )}
            onClick={handleToggleClick}
            data-error={error}
          >
            <ChevronDownIcon className="h-5" />
          </button>
        }
      />
    </MenuProvider>
  );
});

export type { Option as SelectOption };
