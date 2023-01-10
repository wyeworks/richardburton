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
    translated_book
    |> cast(attrs, [])
    |> cast_assoc(:authors, required: true)
    |> cast_assoc(:original_book, required: true)
    |> validate_length(:authors, min: 1)
    |> authors_fingerprint()
    |> unique_constraint([:authors_fingerprint, :original_book_id])
  end

  defp authors_fingerprint(changeset) do
    authors_fingerprint =
      changeset
      |> get_field(:authors)
      |> Enum.map(&Author.to_map/1)
      |> Enum.map_join(&Map.get(&1, :name))
      |> Util.create_fingerprint()

    put_change(changeset, :authors_fingerprint, authors_fingerprint)
  end

  def maybe_insert!(attrs) do
    %TranslatedBook{}
    |> changeset(attrs)
    |> link_original_book
    |> link_authors
    |> Repo.maybe_insert!([:authors_fingerprint, :original_book])
  end

  defp link_original_book(changeset = %{valid?: true}) do
    original_book =
      changeset
      |> get_change(:original_book)
      |> apply_changes()
      |> OriginalBook.to_map()
      |> OriginalBook.maybe_insert!()

    put_assoc(changeset, :original_book, original_book)
  end

  defp link_original_book(changeset = %{valid?: false}), do: changeset

  defp link_authors(changeset = %{valid?: true}) do
    authors =
      changeset
      |> get_change(:authors)
      |> Enum.map(&apply_changes/1)
      |> Enum.map(&Author.to_map/1)
      |> Enum.map(&Author.maybe_insert!/1)

    put_assoc(changeset, :authors, authors)
  end

  defp link_authors(changeset = %{valid?: false}), do: changeset

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
