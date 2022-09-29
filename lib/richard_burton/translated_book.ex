defmodule RichardBurton.TranslatedBook do
  @moduledoc """
  Model for translated books
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Repo
  alias RichardBurton.OriginalBook

  @derive {Jason.Encoder,
           only: [
             :authors,
             :country,
             :publisher,
             :title,
             :year
           ]}
  schema "translated_books" do
    field :authors, :string
    field :country, :string
    field :publisher, :string
    field :title, :string
    field :year, :integer

    belongs_to :original_book, OriginalBook

    timestamps()
  end

  @doc false
  def changeset(translated_book, attrs \\ %{}) do
    original_book = OriginalBook.maybe_insert(attrs.original_book)

    translated_book
    |> cast(attrs, [
      :title,
      :authors,
      :year,
      :country,
      :publisher
    ])
    |> validate_required([
      :title,
      :authors,
      :year,
      :country,
      :publisher
    ])
    |> put_assoc(:original_book, original_book)
    |> unique_constraint([
      :authors,
      :title,
      :year,
      :country,
      :publisher
    ])
  end

  def maybe_insert(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.maybe_insert(
      authors: attrs.authors,
      title: attrs.title,
      year: attrs.year,
      country: attrs.country,
      publisher: attrs.publisher
    )
  end
end
