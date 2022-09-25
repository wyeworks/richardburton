defmodule RichardBurton.TranslatedBook do
  @moduledoc """
  Model for translated books
  """
  use Ecto.Schema
  import Ecto.Changeset

  schema "translated_books" do
    field :authors, :string
    field :country, :string
    field :original_authors, :string
    field :original_title, :string
    field :publisher, :string
    field :title, :string
    field :year, :integer

    timestamps()
  end

  @doc false
  def changeset(translated_book, attrs) do
    translated_book
    |> cast(attrs, [
      :original_title,
      :original_authors,
      :title,
      :authors,
      :year,
      :country,
      :publisher
    ])
    |> validate_required([
      :original_title,
      :original_authors,
      :title,
      :authors,
      :year,
      :country,
      :publisher
    ])
  end
end
