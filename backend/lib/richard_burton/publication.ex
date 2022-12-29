defmodule RichardBurton.Publication do
  @moduledoc """
  Schema for publications
  """
  use Ecto.Schema
  import Ecto.Changeset

  require Ecto.Query
  import Ecto.Query, only: [where: 3]

  alias RichardBurton.Repo
  alias RichardBurton.TranslatedBook
  alias __MODULE__

  @derive {Jason.Encoder, only: [:country, :publisher, :title, :year, :translated_book]}
  schema "publications" do
    field(:country, :string)
    field(:publisher, :string)
    field(:title, :string)
    field(:year, :integer)

    belongs_to(:translated_book, TranslatedBook)

    timestamps()
  end

  @doc false
  def changeset(publication, attrs \\ %{}) do
    # Compute basic changeset with translated_book validation
    result =
      publication
      |> cast(attrs, [:title, :year, :country, :publisher])
      |> cast_assoc(:translated_book)
      |> validate_required([
        :title,
        :year,
        :country,
        :publisher,
        :translated_book
      ])

    # Check if translated_book is valid
    if result.valid? do
      # Insert or fetch the valid translated_book
      translated_book_attrs = get_translated_book_attrs_from_changeset(result)
      translated_book = TranslatedBook.maybe_insert!(translated_book_attrs)

      # Compute complete changeset with the complete translated_book associated
      result
      |> put_assoc(:translated_book, translated_book)
      |> unique_constraint([:title, :year, :country, :publisher])
    else
      # Return the changeset with the translated_book validation errors
      result
    end
  end

  defp get_translated_book_attrs_from_changeset(changeset) do
    translated_book_changes = changeset.changes.translated_book.changes
    original_book = Map.from_struct(translated_book_changes.original_book.data)
    Map.merge(translated_book_changes, %{original_book: original_book})
  end

  def all do
    Publication
    |> Repo.all()
    |> Repo.preload(translated_book: [:original_book])
  end

  def insert(attrs) do
    %Publication{}
    |> changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, publication} ->
        {:ok, publication}

      {:error, changeset} ->
        {:error, get_errors(changeset)}
    end
  end

  def validate(attrs) do
    changeset = changeset(%Publication{}, attrs)

    if changeset.valid? do
      unique_key = [:title, :country, :year, :publisher]
      unique_key_values = Repo.get_unique_key_values(unique_key, changeset)
      unique_key_paired = Enum.zip(unique_key, unique_key_values)

      entity_exists? = Publication |> where([], ^unique_key_paired) |> Repo.exists?()

      if entity_exists? do
        {:error, :conflict}
      else
        {:ok, attrs}
      end
    else
      {:error, get_errors(changeset)}
    end
  end

  defp get_errors(changeset) do
    case Repo.get_errors(changeset) do
      %{title: :unique} -> :conflict
      error_map -> error_map
    end
  end

  def insert_all(attrs_list) do
    Repo.transaction(fn ->
      Enum.map(attrs_list, &insert_or_rollback/1)
    end)
  end

  defp insert_or_rollback(attrs) do
    case insert(attrs) do
      {:ok, publication} ->
        publication

      {:error, errors} ->
        Repo.rollback({attrs, errors})
    end
  end

  def from_csv!(path) do
    try do
      path
      |> File.stream!()
      |> CSV.decode!(
        separator: ?;,
        headers: [
          :original_authors,
          :year,
          :country,
          :original_title,
          :title,
          :authors,
          :publisher
        ]
      )
      |> Enum.map(&nest/1)
    rescue
      e in CSV.RowLengthError ->
        Kernel.reraise(e, __STACKTRACE__)

      _ ->
        Kernel.reraise("Could not parse publication", __STACKTRACE__)
    end
  end

  defp nest(%{
         title: title,
         country: country,
         publisher: publisher,
         authors: authors,
         year: year_string,
         original_title: original_title,
         original_authors: original_authors
       }) do
    year =
      case Integer.parse(year_string) do
        {year, _} -> year
        :error -> nil
      end

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
end
