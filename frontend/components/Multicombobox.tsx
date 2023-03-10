import {
  ChangeEvent,
  FocusEvent,
  forwardRef,
  HTMLProps,
  KeyboardEvent,
  useRef,
  useState,
} from "react";
import c from "classnames";
import Pill from "./Pill";

import MenuProvider, { MenuOption } from "./MenuProvider";
import { Key } from "app";

type Item = string;

type Props = Omit<HTMLProps<HTMLInputElement>, "value" | "onChange"> & {
  value: Item[];
  onChange: (value: Item[]) => void;
  placeholder: string;
  getOptions: (search: string) => Promise<Item[]> | Item[];
  error?: boolean;
};

export default forwardRef<HTMLDivElement, Props>(function Multicombobox(
  {
    value,
    placeholder,
    getOptions,
    onBlur,
    onFocus,
    onChange,
    onKeyDown,
    error,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  function unselect(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function select(item: Item) {
    if (!value.includes(item)) onChange([...value, item]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const isInputValueBlank = inputValue.trim() === "";

    if (event.key === Key.COMMA) {
      event.preventDefault();

      if (!isInputValueBlank) {
        setInputValue("");
        setOptions([]);
        select(inputValue);
      }
    }

    if (
      (event.key === Key.ENTER || event.key === Key.ARROW_RIGHT) &&
      !isInputValueBlank
    ) {
      setInputValue("");
      setOptions([]);
      setIsOpen(false);
      setActiveIndex(null);
      if (activeIndex != null && options[activeIndex]) {
        select(options[activeIndex]);
      } else {
        select(inputValue);
      }
    }

    if (event.key === Key.BACKSPACE && inputValue === "") {
      unselect(value.length - 1);
    }

    onKeyDown?.(event);
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const v = event.target.value;
    setInputValue(v);

    if (v) {
      const options = await getOptions(v.toLowerCase());

      setIsOpen(true);
      setActiveIndex(0);
      setOptions(options.filter((option) => !value.includes(option)));
    } else {
      setIsOpen(false);
    }
  }

  function handleOptionSelect(option: string) {
    select(option);
    setInputValue("");
    inputRef.current?.focus();
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    setFocused(false);
    onBlur?.(event);
  }

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <MenuProvider
      options={options}
      isOpen={isOpen}
      activeIndex={activeIndex}
      setIsOpen={setIsOpen}
      setActiveIndex={setActiveIndex}
      onSelect={handleOptionSelect}
    >
      <div
        ref={ref}
        className={c(
          "w-full overflow-x-scroll gap-1 inline-flex items-center text-xs rounded h-full scrollbar scrollbar-none",
          "error:shadow-sm ",
          {
            "bg-gray-active shadow-sm error:bg-red-400/80": focused,
            "error:bg-red-300/40": !focused,
            "px-2": value.length === 0,
            "px-1": value.length > 0,
          }
        )}
        data-error={error}
      >
        {value.map((item, index) => (
          <Pill
            key={`${item}-${index}`}
            label={item}
            onRemove={() => unselect(index)}
          />
        ))}
        <input
          {...props}
          ref={inputRef}
          value={inputValue}
          placeholder={value.length === 0 ? placeholder : "Add another"}
          className="bg-transparent outline-none shrink grow error:focus:text-white error:placeholder-white"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          data-error={error}
          data-multiselect-input="true"
        />
      </div>
    </MenuProvider>
  );
});
