import {
  FocusEvent,
  forwardRef,
  HTMLProps,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
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
  error: string;
  value?: Option;
  creatable?: boolean;
  onChange: (option: Option) => void;
  getOptions: (search: string) => Promise<Option[]>;
};

export default forwardRef<HTMLInputElement, Props>(function Select(
  {
    value,
    error,
    creatable,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    getOptions,

    ...props
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [search, setSearch] = useState<string | undefined>();
  const [options, setOptions] = useState<Option[]>([]);

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    if (!creatable) {
      getOptions("").then(setOptions);
    }
    onBlur?.(event);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (!creatable) {
      setSearch("");
      setIsOpen(true);
    }
    onFocus?.(event);
  }

  async function handleInputChange(v: string) {
    setSearch(v);

    if (v) {
      if (creatable) {
        onChange?.({ id: v, label: v });
      } else {
        setActiveIndex(0);
      }

      const options = await getOptions(v.toLowerCase());
      setIsOpen(true);
      setOptions(options);
    } else {
      setIsOpen(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === Key.ENTER || event.key === Key.ARROW_RIGHT) {
      if (activeIndex != null) {
        handleSelect(options[activeIndex]);
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    onKeyDown?.(event);
  }

  function handleToggleClick() {
    setIsOpen((isOpen) => !isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
    getOptions("").then(setOptions);
  }

  function handleSelect(option: Option) {
    if (option) {
      onChange?.(option);
    } else if (creatable && search) {
      onChange?.({ id: search, label: search });
    }
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const inputValue = search === undefined ? value?.label || "" : search;

  useEffect(() => {
    if (!isOpen && !creatable) {
      setSearch(undefined);
    }
  }, [isOpen, creatable]);

  useLayoutEffect(() => {
    getOptions("").then(setOptions);
  }, [getOptions]);

  return (
    <MenuProvider
      options={options}
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
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        value={inputValue}
        error={error}
        aria-autocomplete="list"
        right={
          <button
            className={c(
              "flex items-center justify-center h-5 aspect-square transition-transform rounded-full",
              "outline-none focus:bg-indigo-500 focus:text-white",
              "error:text-white focus:error:bg-red-500",
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
