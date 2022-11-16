defmodule RichardBurton.Publication do
  @moduledoc """
  Schema for publications
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Repo
  alias RichardBurton.TranslatedBook

  @derive {Jason.Encoder,
           only: [:country, :publisher, :title, :year, :translated_book]}
  schema "publications" do
    field(:country, :string)
    field(:publisher, :string)
    field(:title, :string)
    field(:year, :integer)

    belongs_to(:translated_book, TranslatedBook)

    timestamps()
  end

  @doc false
  def changeset(publication, attrs \\ %{}) do
    # Compute basic changeset with translated_book validation
    result =
      publication
      |> cast(attrs, [:title, :year, :country, :publisher])
      |> cast_assoc(:translated_book)
      |> validate_required([
        :title,
        :year,
        :country,
        :publisher,
        :translated_book
      ])

    # Check if translated_book is valid
    if result.valid? do
      # Insert or fetch the valid translated_book
      translated_book = TranslatedBook.maybe_insert!(attrs["translated_book"])

      # Compute complete changeset with the complete translated_book associated
      result
      |> put_assoc(:translated_book, translated_book)
      |> unique_constraint([:title, :year, :country, :publisher])
    else
      # Return the changeset with the translated_book validation errors
      result
    end
  end

  def all do
    __MODULE__
    |> Repo.all()
    |> Repo.preload(translated_book: [:original_book])
  end

  def insert(attrs) do
    %__MODULE__{} |> changeset(attrs) |> Repo.insert()
  end

  def insert_all(entries) do
    Repo.transaction(fn -> Enum.map(entries, &insert/1) end)
  end
end
