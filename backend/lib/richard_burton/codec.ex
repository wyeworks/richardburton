defmodule RichardBurton.Codec do
  @moduledoc """
  Utilities for serialization and deserialization
  """

  @doc ~S"""
    Flattens a nested map, post-processing the resulting `{key, value}` pairs with the given `post` function.
    Lists are not traversed.
    Keys on nested maps are regenerated prepending the key of their parent map.

    Returns the nested map

    ## Examples

        iex> RichardBurton.Codec.flatten(%{})
        %{}

        iex> RichardBurton.Codec.flatten(%{a: 1, b: 2, c: 3})
        %{a: 1, b: 2, c: 3}

        iex> RichardBurton.Codec.flatten(%{a: [1, 2, %{a: 1}]})
        %{a: [1, 2, %{a: 1}]}

        iex> RichardBurton.Codec.flatten(%{a: 1, b: %{a: 1, b: 2, c: 3}})
        %{a: 1, b_a: 1, b_b: 2, b_c: 3}

        iex> RichardBurton.Codec.flatten(%{a: 1, b: [2, 3, %{a: 1, b: 2}], c: %{a: 1, b: 2, c: 3}})
        %{ a: 1, b: [2, 3, %{a: 1, b: 2}], c_a: 1, c_b: 2, c_c: 3}
  """
  def flatten(map, post \\ &Function.identity/1) when is_map(map) and is_function(post) do
    map
    |> Map.to_list()
    |> Enum.reduce([], &do_flatten/2)
    |> Enum.map(&post.(&1))
    |> Map.new()
  end

  defp do_flatten({key, value}, acc) when not is_map(value) do
    [{key, value} | acc]
  end

  defp do_flatten({key, map}, acc) when is_map(map) do
    flatten(map)
    |> Enum.map(fn {k, v} -> {compose_keys(key, k), v} end)
    |> Enum.concat(acc)
  end

  defp compose_keys(key1, key2) when is_atom(key1) and is_atom(key2) do
    String.to_atom(compose_keys("#{key1}", "#{key2}"))
  end

  defp compose_keys(key1, key2) when is_binary(key1) and is_binary(key2) do
    "#{key1}_#{key2}"
  end
end
