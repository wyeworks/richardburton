import { Dispatch, SetStateAction, useState } from "react";
import { ZodDefault, ZodObject, ZodRawShape, ZodSchema, z } from "zod";

function stripDefaults<T extends ZodObject<ZodRawShape>>(
  schema: T,
): [z.infer<T>, T] {
  const [defaults, s] = Object.entries(schema.shape).reduce(
    ([d, s], [key, field]) => {
      if (field instanceof ZodDefault) {
        return [
          { ...d, [key]: field.parse(undefined) },
          { ...s, [key]: field.removeDefault() },
        ];
      }
      return [d, { ...s, [key]: field }];
    },
    [{}, {}] as [Record<string, unknown>, Record<string, ZodSchema>],
  );

  return [defaults, z.object(s) as T] as const;
}

function validate<T extends ZodObject<ZodRawShape>>(
  schema: T,
  input: Partial<z.infer<T>>,
): [Partial<z.infer<T>>, Partial<Record<keyof z.infer<T>, string>>] {
  const parsed: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const [key, field] of Object.entries(schema.shape)) {
    if (!(key in input)) {
      continue;
    }

    const result = field.safeParse(input[key]);

    if (result.success) {
      parsed[key] = result.data;
    } else {
      parsed[key] = input[key]!;
      errors[key] = result.error.errors[0].message;
    }
  }

  return [
    parsed as Partial<z.infer<T>>,
    errors as Partial<Record<keyof z.infer<T>, string>>,
  ];
}

export function useForm<T extends ZodObject<ZodRawShape>>(
  schema: T,
): [
  z.infer<T>,
  Dispatch<SetStateAction<Partial<z.TypeOf<T>>>>,
  Partial<Record<keyof z.infer<T>, string>>,
] {
  const [defaults, strict] = stripDefaults(schema);
  const [values, setValues] = useState<Partial<z.infer<T>>>({});

  const input = { ...defaults, ...values };

  const [parsed, errors] = validate(strict, input);

  return [parsed, setValues, errors];
}
