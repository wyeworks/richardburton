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
    translated_book = TranslatedBook.maybe_insert!(attrs["translated_book"])

    publication
    |> cast(attrs, [:title, :year, :country, :publisher])
    |> validate_required([:title, :year, :country, :publisher])
    |> put_assoc(:translated_book, translated_book)
    |> unique_constraint([:title, :year, :country, :publisher])
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
