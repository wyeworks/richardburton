defmodule RichardBurton.Publication do
  @moduledoc """
  Schema for publications
  """
  use Ecto.Schema
  import Ecto.Changeset

  require Ecto.Query

  alias RichardBurton.Publication
  alias RichardBurton.Repo
  alias RichardBurton.TranslatedBook
  alias RichardBurton.Validation

  @external_attributes [:country, :publisher, :title, :year, :translated_book]

  @derive {Jason.Encoder, only: @external_attributes}
  schema "publications" do
    field(:country, :string)
    field(:publisher, :string)
    field(:title, :string)
    field(:year, :integer)
    field(:translated_book_fingerprint, :string)

    belongs_to(:translated_book, TranslatedBook)

    timestamps()
  end

  @doc false
  def changeset(publication, attrs \\ %{})

  @doc false
  def changeset(publication, attrs = %Publication{}) do
    changeset(publication, Map.from_struct(attrs))
  end

  @doc false
  def changeset(publication, attrs) do
    publication
    |> cast(attrs, [:title, :year, :country, :publisher])
    |> cast_assoc(:translated_book, required: true)
    |> validate_required([:title, :year, :country, :publisher])
    |> TranslatedBook.link_fingerprint()
    |> unique_constraint(
      [:title, :year, :country, :publisher, :translated_book_fingerprint],
      name: "publications_composite_key"
    )
  end

  def all do
    Publication
    |> Repo.all()
    |> preload
  end

  def preload(data) do
    Repo.preload(data, translated_book: [:authors, original_book: [:authors]])
  end

  def insert(attrs) do
    %Publication{}
    |> changeset(attrs)
    |> TranslatedBook.link()
    |> Repo.insert()
    |> case do
      {:ok, publication} ->
        {:ok, preload(publication)}

      {:error, changeset} ->
        {:error, Validation.get_errors(changeset)}
    end
  end

  def validate(attrs) do
    Validation.validate(changeset(%Publication{}, attrs), &TranslatedBook.link/1)
  end

  def insert_all(attrs_list) do
    Repo.transaction(fn ->
      Enum.map(attrs_list, &insert_or_rollback/1)
    end)
  end

  defp insert_or_rollback(attrs) do
    case insert(attrs) do
      {:ok, publication} ->
        publication

      {:error, errors} ->
        Repo.rollback({attrs, errors})
    end
  end

  def to_map(publication) do
    translated_book = TranslatedBook.to_map(publication.translated_book)

    publication
    |> Map.take(@external_attributes)
    |> Map.put(:translated_book, translated_book)
  end
end
