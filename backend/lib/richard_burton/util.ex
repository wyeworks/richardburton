defmodule RichardBurton.Util do
  @moduledoc """
  Utilities for general purpose
  """

  def deep_merge_maps(map1, map2) do
    Map.merge(map1, map2, &deep_merge_resolve/3)
  end

  defp deep_merge_resolve(_, left = %{}, right = %{}) do
    deep_merge_maps(left, right)
  end

  defp deep_merge_resolve(_, _, right) do
    right
  end

  def is_value_blank({_, v}) do
    v == ""
  end

  def stringify_keys(map) when is_map(map) do
    Map.new(map, fn {k, v} -> {Atom.to_string(k), stringify_keys(v)} end)
  end

  def stringify_keys(v) when not is_map(v) do
    v
  end

  def create_fingerprint(data) when is_binary(data) do
    data |> sha256 |> Base.encode16()
  end

  defp sha256(data) do
    :crypto.hash(:sha256, data)
  end
end
