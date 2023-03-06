import {
  FC,
  FocusEvent,
  ForwardedRef,
  forwardRef,
  useMemo,
  useState,
} from "react";
import { Publication } from "modules/publications";
import { Author } from "modules/authors";
import { DataInputProps } from "./DataInput";
import Multicombobox from "./Multicombobox";

export default forwardRef<HTMLElement, DataInputProps>(
  function TextArrayDataInput(
    { rowId, colId, value: data, autoValidated, onChange, onBlur, ...props },
    ref
  ) {
    const validate = Publication.REMOTE.useValidate();
    const override = Publication.STORE.ATTRIBUTES.useOverride();
    const [value, setValue] = useState(data);

    const items = useMemo(
      () => (value === "" ? [] : value.split(",")),
      [value]
    );

    function doValidate() {
      if (autoValidated) {
        validate([rowId]);
      }
    }

    function handleChange(value: string[]) {
      const v = value.join(",");
      setValue(v);
      override(rowId, colId, v);
      doValidate();
      onChange?.(v);
    }

    async function getOptions(search: string) {
      const authors = await Author.REMOTE.search(search);

      return authors
        .map(({ name }) => name)
        .filter((name) => name.toLowerCase().startsWith(search));
    }

    return (
      <Multicombobox
        {...props}
        ref={ref as ForwardedRef<HTMLDivElement>}
        placeholder={Publication.ATTRIBUTE_LABELS[colId]}
        value={items}
        onBlur={doValidate}
        onChange={handleChange}
        getOptions={getOptions}
      />
    );
  }
) as FC<DataInputProps>;
