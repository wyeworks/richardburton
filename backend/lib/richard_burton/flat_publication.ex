defmodule RichardBurton.FlatPublication do
  @moduledoc """
  Schema for publications
  """
  use Ecto.Schema

  alias RichardBurton.FlatPublication

  @external_attributes [
    :title,
    :year,
    :country,
    :publisher,
    :authors,
    :original_title,
    :original_authors
  ]

  @derive {Jason.Encoder, only: @external_attributes}
  schema "flat_publications" do
    field(:title, :string)
    field(:year, :integer)
    field(:country, :string)
    field(:authors, :string)
    field(:publisher, :string)
    field(:original_title, :string)
    field(:original_authors, :string)
  end

  def to_map(ps) when is_list(ps) do
    Enum.map(ps, &FlatPublication.to_map/1)
  end

  def to_map(p) do
    Map.take(p, @external_attributes)
  end
end
