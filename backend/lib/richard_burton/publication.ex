defmodule RichardBurton.Publication do
  @moduledoc """
  Schema for publications
  """
  use Ecto.Schema
  import Ecto.Changeset

  require Ecto.Query

  alias RichardBurton.Repo
  alias RichardBurton.TranslatedBook
  alias __MODULE__

  @external_attributes [:country, :publisher, :title, :year, :translated_book]

  @derive {Jason.Encoder, only: @external_attributes}
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
    # Compute basic changeset with translated book validation
    result =
      publication
      |> cast(attrs, [:title, :year, :country, :publisher])
      |> validate_required([:title, :year, :country, :publisher])
      |> cast_assoc(:translated_book, required: true)

    # Check if translated_book is valid
    if result.valid? do
      # Insert or fetch the valid translated book
      translated_book_attrs = attrs["translated_book"]
      translated_book = TranslatedBook.maybe_insert!(translated_book_attrs)

      # Compute complete changeset with the complete translated book associated
      result
      |> put_assoc(:translated_book, translated_book)
      |> unique_constraint([:title, :year, :country, :publisher])
    else
      # Return the changeset with the translated book validation errors
      result
    end
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
    |> Repo.insert()
    |> case do
      {:ok, publication} ->
        {:ok, preload(publication)}

      {:error, changeset} ->
        {:error, get_errors(changeset)}
    end
  end

  def validate(attrs) do
    changeset = changeset(%Publication{}, attrs)

    if changeset.valid? do
      unique_key = [:title, :country, :year, :publisher]
      unique_key_values = Repo.get_unique_key_values(unique_key, changeset)
      unique_key_paired = Enum.zip(unique_key, unique_key_values)

      entity_exists? = Publication |> where([], ^unique_key_paired) |> Repo.exists?()

      if entity_exists? do
        {:error, :conflict}
      else
        {:ok, attrs}
      end
    else
      {:error, get_errors(changeset)}
    end
  end

  defp get_errors(changeset) do
    case Repo.get_errors(changeset) do
      %{title: :unique} -> :conflict
      error_map -> error_map
    end
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
