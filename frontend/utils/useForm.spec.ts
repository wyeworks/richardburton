import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { z } from "zod";
import { useForm } from "./useForm";

describe("useForm", () => {
  test("returns input props for each value in the schema", () => {
    const Schema = z.object({
      foo: z.string(),
      bar: z.string(),
    });

    const hook = renderHook(() => useForm(Schema));

    expect(hook.result.current).toMatchObject({
      inputs: {
        foo: {
          value: undefined,
          error: undefined,
          onChange: expect.any(Function),
          onBlur: expect.any(Function),
        },

        bar: {
          value: undefined,
          error: undefined,
          onChange: expect.any(Function),
          onBlur: expect.any(Function),
        },
      },
    });
  });

  test("returns form props", () => {
    const Schema = z.object({
      foo: z.string(),
      bar: z.string(),
    });

    const hook = renderHook(() => useForm(Schema));

    expect(hook.result.current).toMatchObject({
      form: {
        onSubmit: expect.any(Function),
      },
    });
  });

  test("returns undefined error for invalid untouched inputs", () => {
    const Schema = z.object({
      foo: z.string().min(1, "Required"),
    });

    const hook = renderHook(() => useForm(Schema));

    expect(hook.result.current).toMatchObject({
      inputs: {
        foo: { error: undefined },
      },
    });
  });

  test("returns undefined error for invalid untouched inputs after blur", () => {
    const Schema = z.object({
      foo: z.string().min(1, "Required"),
    });

    const hook = renderHook(() => useForm(Schema));

    act(() => hook.result.current.inputs.foo.onBlur());

    expect(hook.result.current).toMatchObject({
      inputs: {
        foo: { error: undefined },
      },
    });
  });

  test("returns undefined error for invalid touched inputs after change", () => {
    const Schema = z.object({
      foo: z.string().min(1, "Required"),
    });

    const hook = renderHook(() => useForm(Schema));

    act(() => hook.result.current.inputs.foo.onChange(""));
    expect(hook.result.current).toMatchObject({
      inputs: {
        foo: { error: undefined },
      },
    });
  });

  test("returns error for invalid touched inputs after blur", () => {
    const Schema = z.object({
      foo: z.string().min(1, "Required"),
    });

    const hook = renderHook(() => useForm(Schema));

    act(() => hook.result.current.inputs.foo.onChange(""));
    act(() => hook.result.current.inputs.foo.onBlur());

    expect(hook.result.current).toMatchObject({
      inputs: {
        foo: { error: "Required" },
      },
    });
  });

  test("returns updated input value after change", () => {
    const Schema = z.object({
      foo: z.string().min(1, "Required"),
    });

    const hook = renderHook(() => useForm(Schema));

    act(() => hook.result.current.inputs.foo.onChange("bar"));

    expect(hook.result.current).toMatchObject({
      inputs: {
        foo: { value: "bar" },
      },
    });
  });
});
