defmodule RichardBurton.Publication.Index.SearchDocument do
  @moduledoc """
  Schema for searchable documents
  """
  use Ecto.Schema

  schema "search_documents" do
    field(:document, {:array, :binary})
  end
end
