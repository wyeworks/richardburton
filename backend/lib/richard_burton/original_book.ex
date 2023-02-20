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
    original_book
    |> cast(attrs, [:title])
    |> validate_required([:title])
    |> cast_assoc(:authors, required: true)
    |> validate_length(:authors, min: 1)
    |> Author.link_fingerprint()
    |> unique_constraint([:authors_fingerprint, :title])
  end

  def maybe_insert!(attrs) do
    %OriginalBook{}
    |> changeset(attrs)
    |> Author.link()
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

  def link(changeset = %{valid?: true}) do
    original_book =
      changeset
      |> get_change(:original_book)
      |> apply_changes()
      |> OriginalBook.to_map()
      |> OriginalBook.maybe_insert!()

    put_assoc(changeset, :original_book, original_book)
  end

  def link(changeset = %{valid?: false}), do: changeset
end
