defmodule RichardBurton.OriginalBook do
  @moduledoc """
  Schema for original books
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Author
  alias RichardBurton.Repo
  alias RichardBurton.OriginalBook
  alias RichardBurton.TranslatedBook
  alias RichardBurton.Util

  @external_attributes [:authors, :title]

  @derive {Jason.Encoder, only: @external_attributes}
  schema "original_books" do
    field(:title, :string)
    field(:authors_fingerprint, :binary)

    has_many(:translated_books, TranslatedBook)

    many_to_many(:authors, Author, join_through: "original_book_authors")

    timestamps()
  end

  @doc false
  def changeset(original_book, attrs \\ %{}) do
    # Compute basic changeset with basic validation and authors validation
    result =
      original_book
      |> cast(attrs, [:title])
      |> validate_required([:title])
      |> cast_assoc(:authors, required: true)
      |> validate_length(:authors, min: 1)

    # Check if authors are valid
    if result.valid? do
      # Insert or fetch the valid authors
      authors_attrs = result |> get_field(:authors) |> Enum.map(&Author.to_map/1)
      authors = Enum.map(authors_attrs, &Author.maybe_insert!/1)

      authors_fingerprint =
        authors_attrs
        |> Enum.map_join(&Map.get(&1, "name"))
        |> Util.create_fingerprint()

      # Compute complete changeset with the complete authors associated
      result
      |> put_change(:authors_fingerprint, authors_fingerprint)
      |> put_assoc(:authors, authors)
      |> unique_constraint([:authors_fingerprint, :title])
    else
      # Return the changeset with the author validation errors
      result
    end
  end

  def maybe_insert!(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.maybe_insert!([:authors_fingerprint, :title])
  end

  def to_map(original_book = %OriginalBook{}) do
    authors = Enum.map(original_book.authors, &Author.to_map/1)

    original_book
    |> Map.take(@external_attributes)
    |> Map.put(:authors, authors)
  end

  def all() do
    OriginalBook |> Repo.all() |> preload
  end

  def preload(data) do
    Repo.preload(data, :authors)
  end
end
