defmodule RichardBurton.CodecTest do
  @moduledoc """
  Tests for the Codec module
  """

  use ExUnit.Case, async: true
  doctest RichardBurton.Codec

  alias RichardBurton.Codec

  describe "flatten/1" do
    test "flattens a nested map" do
      input = %{
        a_string: "hey",
        a_number: 1,
        a_list: [1, 2, 3],
        a_tuple: {:error, nil},
        parent_map: %{
          a_string: "bla",
          a_number: 2,
          a_list: ["1", "2", "3"],
          a_tuple: {:ok, 1},
          nil_: nil,
          another_map: %{
            a_string: "bye",
            a_number: 42
          }
        },
        nil_: nil
      }

      output = %{
        a_string: "hey",
        a_number: 1,
        a_list: [1, 2, 3],
        a_tuple: {:error, nil},
        parent_map_a_string: "bla",
        parent_map_a_number: 2,
        parent_map_a_list: ["1", "2", "3"],
        parent_map_a_tuple: {:ok, 1},
        parent_map_nil_: nil,
        parent_map_another_map_a_string: "bye",
        parent_map_another_map_a_number: 42,
        nil_: nil
      }

      assert output == Codec.flatten(input)
    end

    test "preserves key type" do
      input = %{
        "a_string" => "hey",
        "a_number" => 1,
        "a_list" => [1, 2, 3],
        "a_tuple" => {:error, nil},
        "parent_map" => %{
          "a_string" => "bla",
          "a_number" => 42
        },
        "nil_" => nil
      }

      output = %{
        "a_string" => "hey",
        "a_number" => 1,
        "a_list" => [1, 2, 3],
        "a_tuple" => {:error, nil},
        "parent_map_a_string" => "bla",
        "parent_map_a_number" => 42,
        "nil_" => nil
      }

      assert output == Codec.flatten(input)
    end

    test "modifies keys of the resulting flat map" do
      input = %{
        a_string: "hey",
        a_number: 1,
        a_list: [1, 2, 3],
        a_tuple: {:error, nil},
        nil_: nil
      }

      output = %{
        "a_string" => "hey",
        "a_number" => 1,
        "a_list" => [1, 2, 3],
        "a_tuple" => {:error, nil},
        "nil_" => nil
      }

      assert output == Codec.flatten(input, fn {k, v} -> {Atom.to_string(k), v} end)
    end
  end
end
