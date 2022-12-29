defmodule RichardBurton.Publication.Codec do
  @moduledoc """
  Serialization and deserialization utilities for publications
  """

  alias RichardBurton.Publication

  @empty_nested_attrs %{
    "title" => "",
    "year" => "",
    "country" => "",
    "publisher" => "",
    "translated_book" => %{
      "authors" => "",
      "original_book" => %{
        "title" => "",
        "authors" => ""
      }
    }
  }

  @empty_flat_attrs %{
    "title" => "",
    "year" => "",
    "country" => "",
    "publisher" => "",
    "authors" => "",
    "original_title" => "",
    "original_authors" => ""
  }

  def from_csv(path) do
    try do
      publications =
        path
        |> File.stream!()
        |> CSV.decode!(
          separator: ?;,
          headers: [
            "original_authors",
            "year",
            "country",
            "original_title",
            "title",
            "authors",
            "publisher"
          ]
        )
        |> Enum.map(&deep_merge_maps(@empty_flat_attrs, &1))
        |> nest

      {:ok, publications}
    rescue
      _ in CSV.EscapeSequenceError ->
        {:error, :invalid_escape_sequence}

      _ in CSV.StrayEscapeCharacterError ->
        {:error, :stray_escape_character}

      _ in File.Error ->
        {:error, :file_not_found}
    end
  end

  def nest(%{
        "title" => title,
        "year" => year,
        "country" => country,
        "publisher" => publisher,
        "authors" => authors,
        "original_title" => original_title,
        "original_authors" => original_authors
      }) do
    %{
      "title" => title,
      "year" => year,
      "country" => country,
      "publisher" => publisher,
      "translated_book" => %{
        "authors" => authors,
        "original_book" => %{
          "title" => original_title,
          "authors" => original_authors
        }
      }
    }
  end

  def nest(flat_publications) when is_list(flat_publications) do
    Enum.map(flat_publications, &nest/1)
  end

  def flatten(%{
        "title" => title,
        "year" => year,
        "country" => country,
        "publisher" => publisher,
        "translated_book" => %{
          "authors" => authors,
          "original_book" => %{
            "title" => original_title,
            "authors" => original_authors
          }
        }
      }) do
    %{
      "title" => title,
      "year" => year,
      "country" => country,
      "publisher" => publisher,
      "authors" => authors,
      "original_title" => original_title,
      "original_authors" => original_authors
    }
  end

  def flatten(p = %Publication{}) do
    p
    |> Publication.to_map()
    |> flatten
  end

  def flatten(
        p = %{
          title: _title,
          year: _year,
          country: _country,
          publisher: _publisher,
          translated_book: %{
            authors: _authors,
            original_book: %{
              title: _original_title,
              authors: _original_authors
            }
          }
        }
      ) do
    p |> stringify_keys |> flatten
  end

  def flatten(%{publication: publication, errors: nil}) do
    %{publication: flatten(publication), errors: nil}
  end

  def flatten(%{publication: publication, errors: errors}) when is_atom(errors) do
    %{publication: flatten(publication), errors: errors}
  end

  def flatten(%{publication: publication, errors: errors}) do
    %{
      publication: flatten(publication),
      errors:
        @empty_nested_attrs
        |> deep_merge_maps(stringify_keys(errors))
        |> flatten
        |> Enum.reject(&is_value_blank/1)
        |> Enum.into(%{})
    }
  end

  def flatten(publications) when is_list(publications) do
    Enum.map(publications, &flatten/1)
  end

  defp stringify_keys(map) when is_map(map) do
    Map.new(map, fn {k, v} -> {Atom.to_string(k), stringify_keys(v)} end)
  end

  defp stringify_keys(v) when not is_map(v) do
    v
  end

  defp deep_merge_maps(map1, map2) do
    Map.merge(map1, map2, &deep_merge_resolve/3)
  end

  defp deep_merge_resolve(_, left = %{}, right = %{}) do
    deep_merge_maps(left, right)
  end

  defp deep_merge_resolve(_, _, right) do
    right
  end

  defp is_value_blank({_, v}) do
    v == ""
  end
end
