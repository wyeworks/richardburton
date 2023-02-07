defmodule RichardBurton.Publication.Codec do
  @moduledoc """
  Serialization and deserialization utilities for publications
  """

  alias RichardBurton.Codec
  alias RichardBurton.Util
  alias RichardBurton.Publication
  alias RichardBurton.FlatPublication

  @empty_flat_attrs %{
    "title" => "",
    "year" => "",
    "country" => "",
    "publisher" => "",
    "authors" => "",
    "original_title" => "",
    "original_authors" => ""
  }

  @csv_headers [
    "original_authors",
    "year",
    "country",
    "original_title",
    "title",
    "authors",
    "publisher"
  ]

  def from_csv(path) do
    try do
      publications =
        path
        |> File.stream!()
        |> CSV.decode!(separator: ?;, headers: @csv_headers)
        |> Enum.map(&Util.deep_merge_maps(@empty_flat_attrs, &1))

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

  def to_csv(flat_publications) do
    flat_publications
    |> Enum.map(&Util.stringify_keys/1)
    |> Enum.map(&Map.take(&1, @csv_headers))
    |> CSV.encode(separator: ?;, delimiter: "\n", headers: true)
    |> Enum.to_list()
  end

  def from_csv!(path) do
    case from_csv(path) do
      {:ok, publications} -> publications
      {:error, error} -> throw(error)
    end
  end

  def nest(flat_publication = %FlatPublication{}) do
    attrs =
      flat_publication
      |> Map.from_struct()
      |> Map.delete(:__meta__)
      |> nest

    %Publication{}
    |> Publication.changeset(attrs)
    |> Ecto.Changeset.apply_changes()
  end

  def nest(flat_publication_like_map) when is_map(flat_publication_like_map) do
    flat_publication_like_map
    |> Map.new(&(&1 |> Util.stringify_keys() |> nest_entry |> rename_key))
    |> Codec.nest()
  end

  def nest(flat_publication_like_maps) when is_list(flat_publication_like_maps) do
    Enum.map(flat_publication_like_maps, &nest/1)
  end

  defp nest_entry({"authors", value}),
    do: {"authors", nest_authors(value)}

  defp nest_entry({"original_authors", value}),
    do: {"original_authors", nest_authors(value)}

  defp nest_entry({key, value}),
    do: {key, value}

  defp nest_authors(authors) when is_binary(authors) do
    Enum.map(String.split(authors, ","), &%{"name" => String.trim(&1)})
  end

  def flatten(publication = %Publication{}) do
    attrs =
      publication
      |> map_from_struct
      |> Map.delete(:__meta__)
      |> flatten

    %FlatPublication{}
    |> FlatPublication.changeset(attrs)
    |> Ecto.Changeset.apply_changes()
  end

  def flatten(%{publication: publication, errors: errors})
      when is_nil(errors) or is_atom(errors) do
    %{"publication" => flatten(publication), "errors" => errors}
  end

  def flatten(%{publication: publication, errors: errors}) do
    %{"publication" => flatten(publication), "errors" => flatten(errors)}
  end

  def flatten(publication_like_maps) when is_list(publication_like_maps) do
    Enum.map(publication_like_maps, &flatten/1)
  end

  def flatten(publication_like_map) when is_map(publication_like_map) do
    publication_like_map |> Codec.flatten() |> Map.new(&(&1 |> rename_key |> flatten_entry))
  end

  defp flatten_entry({"authors", value}),
    do: {"authors", flatten_authors(value)}

  defp flatten_entry({"original_authors", value}),
    do: {"original_authors", flatten_authors(value)}

  defp flatten_entry({key, value}),
    do: {key, value}

  defp flatten_authors(authors) when is_list(authors) do
    Enum.map_join(authors, ", ", &(Map.get(&1, "name") || Map.get(&1, :name)))
  end

  defp flatten_authors(authors), do: authors

  defp rename_key({"translated_book_authors", v}), do: {"authors", v}
  defp rename_key({"translated_book_original_book_title", v}), do: {"original_title", v}
  defp rename_key({"translated_book_original_book_authors", v}), do: {"original_authors", v}

  defp rename_key({"authors", v}), do: {"translated_book_authors", v}
  defp rename_key({"original_title", v}), do: {"translated_book_original_book_title", v}
  defp rename_key({"original_authors", v}), do: {"translated_book_original_book_authors", v}

  defp rename_key({key, value}), do: {key, value}

  defp map_from_struct(struct) when is_struct(struct) do
    struct
    |> Map.from_struct()
    |> Map.new(fn {key, value} -> {key, map_from_struct(value)} end)
  end

  defp map_from_struct(value), do: value
end
