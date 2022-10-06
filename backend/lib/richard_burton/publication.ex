defmodule RichardBurton.Publication do
  @moduledoc """
  Schema for publications
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Repo
  alias RichardBurton.TranslatedBook

  @derive {Jason.Encoder,
           only: [:country, :publisher, :title, :year, :translated_book]}
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
    __MODULE__
    |> Repo.all()
    |> Repo.preload(translated_book: [:original_book])
  end

  def insert(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, publication} ->
        {:ok, publication}

      {:error, changeset} ->
        Repo.get_errors(changeset)
        |> case do
          %{title: :unique} -> {:error, :conflict}
          error_map -> {:error, error_map}
        end
    end
  end
end
