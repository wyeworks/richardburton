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
    original_book
    |> cast(attrs, [:title])
    |> validate_required([:title])
    |> cast_assoc(:authors, required: true)
    |> validate_length(:authors, min: 1)
    |> authors_fingerprint
    |> unique_constraint([:authors_fingerprint, :title])
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
    %OriginalBook{}
    |> changeset(attrs)
    |> link_authors
    |> Repo.maybe_insert!([:authors_fingerprint, :title])
  end

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
