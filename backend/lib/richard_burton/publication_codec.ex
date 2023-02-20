defmodule RichardBurton.Publication.Codec do
  @moduledoc """
  Serialization and deserialization utilities for publications
  """

  alias RichardBurton.Codec
  alias RichardBurton.Util
  alias RichardBurton.Publication

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
        |> Enum.map(&Util.deep_merge_maps(@empty_flat_attrs, &1))
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
        "authors" => nest_authors(authors),
        "original_book" => %{
          "title" => original_title,
          "authors" => nest_authors(original_authors)
        }
      }
    }
  end

  def nest(flat_publications) when is_list(flat_publications) do
    Enum.map(flat_publications, &nest/1)
  end

  def flatten(
        p = %{
          "title" => _title,
          "year" => _year,
          "country" => _country,
          "publisher" => _publisher,
          "translated_book" => %{
            "authors" => _authors,
            "original_book" => %{
              "title" => _original_title,
              "authors" => _original_authors
            }
          }
        }
      ) do
    Codec.flatten(p, &(&1 |> rename_key |> flatten_value))
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
    Codec.flatten(p, &(&1 |> rename_key |> flatten_value |> Util.stringify_keys()))
  end

  def flatten(%{publication: publication, errors: nil}) do
    %{publication: flatten(publication), errors: nil}
  end

  def flatten(%{publication: publication, errors: errors}) when is_atom(errors) do
    %{publication: flatten(publication), errors: errors}
  end

  def flatten(%{publication: publication, errors: errors}) when is_map(errors) do
    %{
      publication: flatten(publication),
      errors: flatten_errors(errors)
    }
  end

  def flatten(publications) when is_list(publications) do
    Enum.map(publications, &flatten/1)
  end

  defp nest_authors(authors) do
    Enum.map(String.split(authors, ","), &%{"name" => String.trim(&1)})
  end

  defp flatten_authors(authors) when is_list(authors) do
    Enum.map_join(authors, ", ", &(Map.get(&1, "name") || Map.get(&1, :name)))
  end

  defp flatten_authors_error(authors) when is_list(authors) do
    authors |> List.first() |> Map.get(:name)
  end

  defp flatten_errors(errors) do
    Codec.flatten(errors, &(&1 |> rename_key |> flatten_error |> Util.stringify_keys()))
  end

  defp rename_key({:translated_book_authors, v}), do: {:authors, v}
  defp rename_key({:translated_book_original_book_title, v}), do: {:original_title, v}
  defp rename_key({:translated_book_original_book_authors, v}), do: {:original_authors, v}
  defp rename_key({"translated_book_authors", v}), do: {"authors", v}
  defp rename_key({"translated_book_original_book_title", v}), do: {"original_title", v}
  defp rename_key({"translated_book_original_book_authors", v}), do: {"original_authors", v}
  defp rename_key({key, value}), do: {key, value}

  defp flatten_value({"authors", value}),
    do: {"authors", flatten_authors(value)}

  defp flatten_value({"original_authors", value}),
    do: {"original_authors", flatten_authors(value)}

  defp flatten_value({:authors, value}),
    do: {:authors, flatten_authors(value)}

  defp flatten_value({:original_authors, value}),
    do: {:original_authors, flatten_authors(value)}

  defp flatten_value({key, value}),
    do: {key, value}

  defp flatten_error({:authors, error}),
    do: {:authors, flatten_authors_error(error)}

  defp flatten_error({:original_authors, error}),
    do: {:original_authors, flatten_authors_error(error)}

  defp flatten_error({"authors", error}),
    do: {"authors", flatten_authors_error(error)}

  defp flatten_error({"original_authors", error}),
    do: {"original_authors", flatten_authors_error(error)}

  defp flatten_error({key, error}),
    do: {key, error}
end
