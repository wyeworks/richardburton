defmodule RichardBurton.TranslatedBook do
  @moduledoc """
  Schema for translated books
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Author
  alias RichardBurton.OriginalBook
  alias RichardBurton.Publication
  alias RichardBurton.Repo
  alias RichardBurton.TranslatedBook
  alias RichardBurton.Util

  @external_attributes [:authors, :original_book]

  @derive {Jason.Encoder, only: @external_attributes}
  schema "translated_books" do
    field(:authors_fingerprint, :string)
    field(:original_book_fingerprint, :string)

    has_many(:publications, Publication)

    belongs_to(:original_book, OriginalBook)

    many_to_many(:authors, Author, join_through: "translated_book_authors")

    timestamps()
  end

  @doc false
  def changeset(translated_book, attrs \\ %{})

  @doc false
  def changeset(translated_book, attrs = %TranslatedBook{}) do
    changeset(translated_book, Map.from_struct(attrs))
  end

  @doc false
  def changeset(translated_book, attrs) do
    translated_book
    |> cast(attrs, [])
    |> cast_assoc(:authors, required: true)
    |> cast_assoc(:original_book, required: true)
    |> validate_length(:authors, min: 1)
    |> OriginalBook.link_fingerprint()
    |> Author.link_fingerprint()
    |> unique_constraint(
      [:authors_fingerprint, :original_book_fingerprint],
      name: "translated_books_composite_key"
    )
  end

  def maybe_insert!(attrs) do
    %TranslatedBook{}
    |> changeset(attrs)
    |> OriginalBook.link()
    |> Author.link()
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

  def link(changeset = %{valid?: true}) do
    translated_book =
      changeset
      |> get_change(:translated_book)
      |> apply_changes()
      |> TranslatedBook.to_map()
      |> TranslatedBook.maybe_insert!()

    put_assoc(changeset, :translated_book, translated_book)
  end

  def link(changeset = %{valid?: false}), do: changeset

  def fingerprint(%TranslatedBook{
        original_book_fingerprint: original_book_fingerprint,
        authors_fingerprint: authors_fingerprint
      }) do
    [original_book_fingerprint, authors_fingerprint]
    |> Enum.join()
    |> Util.create_fingerprint()
  end

  def link_fingerprint(changeset = %Ecto.Changeset{valid?: true}) do
    translated_book_fingerprint =
      changeset
      |> get_field(:translated_book)
      |> fingerprint

    put_change(changeset, :translated_book_fingerprint, translated_book_fingerprint)
  end

  def link_fingerprint(changeset = %Ecto.Changeset{valid?: false}), do: changeset
end
