import {
  forwardRef,
  HTMLProps,
  KeyboardEvent,
  MouseEvent,
  useEffect,
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
  error: string;
  value: Option | undefined;
  onChange: (option: Option) => void;
};

export default forwardRef<HTMLInputElement, Props>(function Select(
  { value, error, options, onChange, onFocus, onKeyDown, onBlur, ...props },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [search, setSearch] = useState<string | undefined>();

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
      handleSelect(filteredOptions[activeIndex]);
      setIsOpen(false);
      inputRef.current?.blur();
    }

    onKeyDown?.(event);
  }

  function handleToggleClick(_event: MouseEvent<HTMLButtonElement>) {
    setIsOpen((isOpen) => !isOpen);
    setSearch("");
    inputRef.current?.focus();
  }

  function handleSelect(option: Option) {
    onChange?.(option);
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (search) {
      return options.filter((opt) =>
        opt.label.toLowerCase().startsWith(search.toLowerCase())
      );
    } else {
      return options;
    }
  }, [options, search]);

  const inputValue = search === undefined ? value?.label || "" : search;

  useEffect(() => {
    if (!isOpen) {
      setSearch(undefined);
    }
  }, [isOpen]);

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
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        value={inputValue}
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
            data-error={Boolean(error)}
          >
            <ChevronDownIcon className="h-5" />
          </button>
        }
      />
    </MenuProvider>
  );
});

export type { Option as SelectOption };
