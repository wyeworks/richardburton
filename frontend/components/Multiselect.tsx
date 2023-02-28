import { FC, KeyboardEventHandler, useRef, useState } from "react";
import c from "classnames";
import Pill from "./Pill";

import MenuProvider from "./MenuProvider";

type Props = { getOptions: (search: string) => Promise<string[]> | string[] };

const Multiselect: FC<Props> = ({ getOptions }) => {
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

    if (event.key === ",") {
      event.preventDefault();

      if (!isInputValueBlank) {
      setInputValue("");
        setOptions([]);
      addItem(inputValue);
    }
    }

    if (event.key === "Enter" && !isInputValueBlank) {
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

    if (event.key === "Backspace" && inputValue === "") {
      setItems((items) => items.slice(0, -1));
    }
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
  };

  const handleOptionSelect = (option: string) => {
    addItem(option);
    setInputValue("");
    inputRef.current?.focus();
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
        className={c(
          "w-full overflow-x-scroll gap-1 inline-flex items-center text-xs rounded py-1 scrollbar scrollbar-none",
          {
            "bg-gray-active shadow-sm": focused,
            "px-2": items.length === 0,
            "px-1": items.length > 0,
          }
        )}
      >
        {items.map((item, index) => (
          <Pill
            key={`${item}-${index}`}
            label={item}
            onRemove={() => removeItem(index)}
          />
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          className="bg-transparent outline-none shrink grow"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
        />
      </div>
    </MenuProvider>
  );
};

export default Multiselect;
