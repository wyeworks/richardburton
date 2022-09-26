defmodule RichardBurton.TranslatedBook do
  @moduledoc """
  Model for translated books
  """
  use Ecto.Schema
  import Ecto.Changeset

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
  def changeset(translated_book, attrs) do
    translated_book
    |> cast(attrs, [
      :title,
      :authors,
      :year,
      :country,
      :publisher,
      :original_id
    ])
    |> validate_required([
      :title,
      :authors,
      :year,
      :country,
      :publisher,
      :original_id
    ])
  end
end
