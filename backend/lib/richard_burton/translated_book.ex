defmodule RichardBurton.TranslatedBook do
  @moduledoc """
  Schema for translated books
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Repo
  alias RichardBurton.OriginalBook
  alias RichardBurton.Publication

  @derive {Jason.Encoder, only: [:authors, :original_book]}
  schema "translated_books" do
    field(:authors, :string)

    belongs_to(:original_book, OriginalBook)
    has_many(:publications, Publication)

    timestamps()
  end

  @doc false
  def changeset(translated_book, attrs \\ %{}) do
    # Compute basic changeset with original_book validation
    result =
      translated_book
      |> cast(attrs, [:authors])
      |> cast_assoc(:original_book)
      |> validate_required([:authors, :original_book])

    # Check if original_book is valid
    if result.valid? do
      # Insert or fetch the valid original book
      original_book_attrs = result.changes.original_book.changes
      original_book = OriginalBook.maybe_insert!(original_book_attrs)

      # Compute complete changeset with the complete original_book associated
      translated_book
      |> cast(attrs, [:authors])
      |> put_assoc(:original_book, original_book)
      |> validate_required([:authors, :original_book])
      |> unique_constraint([:authors, :original_book_id])
    else
      result.valid?
      # Return the changeset with the original_book validation errors
      result
    end
  end

  def maybe_insert!(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.maybe_insert!([:authors, :original_book])
  end

  def all() do
    __MODULE__ |> Repo.all() |> Repo.preload(:original_book)
  end
end
