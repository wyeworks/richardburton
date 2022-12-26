defmodule RichardBurton.OriginalBook do
  @moduledoc """
  Schema for original books
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Repo
  alias RichardBurton.TranslatedBook

  @external_attributes [:authors, :title]

  @derive {Jason.Encoder, only: @external_attributes}
  schema "original_books" do
    field(:authors, :string)
    field(:title, :string)

    has_many(:translated_books, TranslatedBook)

    timestamps()
  end

  @doc false
  def changeset(original_book, attrs \\ %{}) do
    original_book
    |> cast(attrs, [:authors, :title])
    |> validate_required([:authors, :title])
    |> unique_constraint([:authors, :title])
  end

  def maybe_insert!(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.maybe_insert!([:authors, :title])
  end

  def to_map(original_book) do
    Map.take(original_book, @external_attributes)
  end
end
