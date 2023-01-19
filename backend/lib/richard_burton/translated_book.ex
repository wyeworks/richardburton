defmodule RichardBurton.TranslatedBook do
  @moduledoc """
  Schema for translated books
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Author
  alias RichardBurton.Repo
  alias RichardBurton.OriginalBook
  alias RichardBurton.TranslatedBook
  alias RichardBurton.Publication
  alias RichardBurton.Util

  @external_attributes [:authors, :original_book]

  @derive {Jason.Encoder, only: @external_attributes}
  schema "translated_books" do
    field(:authors_fingerprint, :string)

    has_many(:publications, Publication)

    belongs_to(:original_book, OriginalBook)

    many_to_many(:authors, Author, join_through: "translated_book_authors")

    timestamps()
  end

  @doc false
  def changeset(translated_book, attrs \\ %{}) do
    # Compute basic changeset with original_book validation
    result =
      translated_book
      |> cast(attrs, [])
      |> cast_assoc(:authors, required: true)
      |> cast_assoc(:original_book, required: true)
      |> validate_length(:authors, min: 1)

    # Check if original_book is valid
    if result.valid? do
      # Insert or fetch the valid original book
      original_book_attrs = result |> get_field(:original_book) |> OriginalBook.to_map()
      original_book = OriginalBook.maybe_insert!(original_book_attrs)

      # Insert or fetch the valid authors
      authors_attrs = result |> get_field(:authors) |> Enum.map(&Author.to_map/1)
      authors = Enum.map(authors_attrs, &Author.maybe_insert!/1)

      authors_fingerprint =
        authors_attrs
        |> Enum.map_join(&Map.get(&1, :name))
        |> Util.create_fingerprint()

      # Compute complete changeset with the complete original book and authors associated
      result
      |> put_change(:authors_fingerprint, authors_fingerprint)
      |> put_assoc(:authors, authors)
      |> put_assoc(:original_book, original_book)
      |> unique_constraint([:authors_fingerprint, :original_book_id])
    else
      # Return the changeset with the original_book validation errors
      result
    end
  end

  def maybe_insert!(attrs) do
    %TranslatedBook{}
    |> changeset(attrs)
    |> Repo.maybe_insert!([:authors_fingerprint, :original_book])
  end

  def all() do
    TranslatedBook
    |> Repo.all()
    |> preload
  end

  def preload(data) do
    Repo.preload(data, [:authors, original_book: [:authors]])
  end

  def to_map(translated_book) do
    original_book = OriginalBook.to_map(translated_book.original_book)
    authors = Enum.map(translated_book.authors, &Author.to_map/1)

    translated_book
    |> Map.take(@external_attributes)
    |> Map.put(:original_book, original_book)
    |> Map.put(:authors, authors)
  end
end
