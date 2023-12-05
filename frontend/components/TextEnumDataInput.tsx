import { Publication } from "modules/publication";
import { FC, forwardRef, useCallback, useMemo } from "react";
import { DataInputProps } from "./DataInput";
import Select, { SelectOption } from "./Select";
import pDebounce from "p-debounce";

export default forwardRef<HTMLInputElement, DataInputProps>(
  function TextEnumDataInput({ colId, value, onChange, ...props }, ref) {
    function handleChange(option: SelectOption) {
      console.log(option);
      onChange?.(option.id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getOptions = useCallback(
      pDebounce(async (search: string) => {
        if (colId === "originalTitle") {
          const books = await Publication.autocomplete(search, colId);

          const options = books.map(({ authors, title }) => ({
            id: title,
            label: title,
            sublabel: authors,
          }));

          return options;
        }

        return Publication.autocomplete(search, colId);
      }, 350),
      [colId]
    );

    const selectedOption = useMemo(
      () =>
        value
          ? { id: value, label: Publication.describeValue(value, colId) }
          : undefined,
      [value, colId]
    );

    return (
      <Select
        {...props}
        ref={ref}
        value={selectedOption}
        onChange={handleChange}
        getOptions={getOptions}
        creatable
      />
    );
  }
) as FC<DataInputProps>;
