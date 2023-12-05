import { forwardRef, HTMLProps, KeyboardEvent, useRef, useState } from "react";
import Pill from "./Pill";

import MenuProvider from "./MenuProvider";
import { Key } from "app";
import TextInput from "./TextInput";

type Item = string;

type Props = Omit<HTMLProps<HTMLInputElement>, "value" | "onChange"> & {
  value: Item[];
  error?: string;
  onChange: (value: Item[]) => void;
  getOptions: (search: string) => Promise<Item[]> | Item[];
};

export default forwardRef<HTMLDivElement, Props>(function Multicombobox(
  { value, placeholder, getOptions, onChange, onKeyDown, error, ...props },
  ref,
) {
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

  async function handleChange(v: string) {
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
      <TextInput
        {...props}
        ref={ref}
        inputRef={inputRef}
        value={inputValue}
        error={error}
        placeholder={value.length === 0 ? placeholder : "Add another"}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        data-multiselect-input="true"
        left={
          <>
            {value.map((item, index) => (
              <Pill
                key={`${item}-${index}`}
                label={item}
                onRemove={() => unselect(index)}
              />
            ))}
          </>
        }
      />
    </MenuProvider>
  );
});
