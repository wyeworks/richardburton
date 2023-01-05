defmodule RichardBurton.Publication.Index.SearchKeyword do
  @moduledoc """
  Schema for searchable documents
  """
  use Ecto.Schema

  @primary_key {:word, :string, []}
  schema "search_keywords" do
  end
end
