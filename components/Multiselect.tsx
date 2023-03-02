import {
  FocusEventHandler,
  forwardRef,
  HTMLProps,
  KeyboardEventHandler,
  useRef,
  useState,
} from "react";
import c from "classnames";
import Pill from "./Pill";

import MenuProvider from "./MenuProvider";
import { Key } from "app";

type Props = HTMLProps<HTMLInputElement> & {
  placeholder: string;
  getOptions: (search: string) => Promise<string[]> | string[];
  "data-error": boolean;
};

export default forwardRef<HTMLDivElement, Props>(function Multiselect(
  {
    placeholder,
    getOptions,
    onBlur,
    onFocus,
    onChange,
    onKeyDown,
    "data-error": error,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<string[]>([]);

  const removeItem = (index: number) => {
    setItems((items) => items.filter((_, i) => i !== index));
  };

  const addItem = (item: string) => {
    if (!items.includes(item)) setItems((items) => [...items, item]);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    const isInputValueBlank = inputValue.trim() === "";

    if (event.key === Key.COMMA) {
      event.preventDefault();

      if (!isInputValueBlank) {
        setInputValue("");
        setOptions([]);
        addItem(inputValue);
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
        addItem(options[activeIndex]);
      } else {
        addItem(inputValue);
      }
    }

    if (event.key === Key.BACKSPACE && inputValue === "") {
      setItems((items) => items.slice(0, -1));
    }

    onKeyDown?.(event);
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value) {
      const options = await getOptions(value.toLowerCase());

      setIsOpen(true);
      setActiveIndex(0);
      setOptions(options.filter((option) => !items.includes(option)));
    } else {
      setIsOpen(false);
    }

    onChange?.(event);
  };

  const handleOptionSelect = (option: string) => {
    addItem(option);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

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
            "px-2": items.length === 0,
            "px-1": items.length > 0,
          }
        )}
        data-error={error}
      >
        {items.map((item, index) => (
          <Pill
            key={`${item}-${index}`}
            label={item}
            onRemove={() => removeItem(index)}
          />
        ))}
        <input
          {...props}
          ref={inputRef}
          value={inputValue}
          placeholder={items.length === 0 ? placeholder : "Add another"}
          className="bg-transparent outline-none shrink grow error:focus:text-white error:placeholder-white"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          data-error={error}
        />
      </div>
    </MenuProvider>
  );
});
