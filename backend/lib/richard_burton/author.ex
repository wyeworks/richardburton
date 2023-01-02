defmodule RichardBurton.Author do
  @moduledoc """
  Schema for authors
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias Hex.API.Auth
  alias RichardBurton.Repo
  alias RichardBurton.OriginalBook
  alias RichardBurton.TranslatedBook
  alias __MODULE__

  @external_attributes [:name]

  @derive {Jason.Encoder, only: @external_attributes}
  schema "authors" do
    field(:name, :string)

    many_to_many(:translated_books, TranslatedBook, join_through: "translated_book_authors")
    many_to_many(:original_books, OriginalBook, join_through: "original_book_authors")

    timestamps()
  end

  @doc false
  def changeset(author, attrs) do
    author
    |> cast(attrs, [:name])
    |> validate_required([:name])
    |> unique_constraint([:name])
  end

  @spec maybe_insert!(:invalid | %{optional(:__struct__) => none, optional(atom | binary) => any}) ::
          any
  def maybe_insert!(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.maybe_insert!([:name])
  end

  def to_map(author = %Author{}) do
    Map.take(author, @external_attributes)
  end

  def all do
    Repo.all(Author)
  end
end
