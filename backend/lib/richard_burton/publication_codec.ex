defmodule RichardBurton.PublicationCodec do
  @moduledoc """
  Serialization and deserialization utilities for publications
  """

  alias RichardBurton.Publication

  def from_csv!(path) do
    try do
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
      |> Enum.into([])
      |> nest
    rescue
      e in CSV.RowLengthError ->
        Kernel.reraise(e, __STACKTRACE__)

      _ ->
        Kernel.reraise("Could not parse publication", __STACKTRACE__)
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

  def flatten(publications) when is_list(publications) do
    Enum.map(publications, &flatten/1)
  end

  defp stringify_keys(map) when is_map(map) do
    Map.new(map, fn {k, v} -> {Atom.to_string(k), stringify_keys(v)} end)
  end

  defp stringify_keys(v) when not is_map(v) do
    v
  end
end
