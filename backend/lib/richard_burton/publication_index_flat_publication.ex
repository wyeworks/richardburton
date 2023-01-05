defmodule RichardBurton.Publication.Index.FlatPublication do
  @moduledoc """
  Schema for publications
  """
  use Ecto.Schema

  @derive {Jason.Encoder,
           only: [
             :title,
             :year,
             :country,
             :publisher,
             :authors,
             :original_title,
             :original_authors
           ]}
  schema "flat_publications" do
    field(:title, :string)
    field(:year, :integer)
    field(:country, :string)
    field(:authors, :string)
    field(:publisher, :string)
    field(:original_title, :string)
    field(:original_authors, :string)
  end
end
