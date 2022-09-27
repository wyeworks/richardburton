defmodule RichardBurton.TranslatedBook do
  @moduledoc """
  Schema for translated books
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Repo
  alias RichardBurton.OriginalBook
  alias RichardBurton.Publication

  @derive {Jason.Encoder, only: [:authors]}
  schema "translated_books" do
    field :authors, :string

    belongs_to :original_book, OriginalBook
    has_many :publications, Publication

    timestamps()
  end

  @doc false
  def changeset(translated_book, attrs \\ %{}) do
    original_book = OriginalBook.maybe_insert(attrs.original_book)

    translated_book
    |> cast(attrs, [:authors])
    |> validate_required([:authors])
    |> put_assoc(:original_book, original_book)
    |> unique_constraint([:authors, :original_book_id])
  end

  def maybe_insert(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.maybe_insert([:authors, :original_book])
  end
end
