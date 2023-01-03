defmodule RichardBurton.Codec do
  @moduledoc """
  Utilities for serialization and deserialization
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

  defp compose_keys(key1, key2) when not is_atom(key1) and not is_atom(key2) do
    "#{key1}_#{key2}"
  end
end
