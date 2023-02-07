defmodule RichardBurton.Author do
  @moduledoc """
  Schema for authors
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Author
  alias RichardBurton.Repo
  alias RichardBurton.OriginalBook
  alias RichardBurton.TranslatedBook
  alias RichardBurton.Util

  @external_attributes [:name]

  @derive {Jason.Encoder, only: @external_attributes}
  schema "authors" do
    field(:name, :string)

    many_to_many(:translated_books, TranslatedBook, join_through: "translated_book_authors")
    many_to_many(:original_books, OriginalBook, join_through: "original_book_authors")

    timestamps()
  end

  @doc false
  def changeset(author, attrs \\ %{})

  @doc false
  def changeset(author, attrs = %Author{}) do
    changeset(author, Map.from_struct(attrs))
  end

  @doc false
  def changeset(author, attrs) do
    author
    |> cast(attrs, [:name])
    |> validate_required([:name])
    |> unique_constraint([:name])
  end

  def maybe_insert!(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.maybe_insert!([:name])
  end

  def all do
    Repo.all(Author)
  end

  def link(changeset = %{valid?: true}) do
    authors =
      changeset
      |> get_change(:authors)
      |> Enum.map(&apply_changes/1)
      |> Enum.map(&Author.maybe_insert!/1)

    put_assoc(changeset, :authors, authors)
  end

  def link(changeset = %{valid?: false}), do: changeset

  def fingerprint(authors) when is_list(authors) do
    authors
    |> Enum.map_join(&Map.get(&1, :name))
    |> Util.create_fingerprint()
  end

  def link_fingerprint(changeset = %Ecto.Changeset{valid?: true}) do
    authors_fingerprint =
      changeset
      |> get_field(:authors)
      |> fingerprint

    put_change(changeset, :authors_fingerprint, authors_fingerprint)
  end

  def link_fingerprint(changeset = %Ecto.Changeset{valid?: false}), do: changeset
end
