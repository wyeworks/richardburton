defmodule RichardBurton.Publication.Index do
  @moduledoc """
  Interface with the searchable publication index
  """

  alias RichardBurton.Repo
  alias RichardBurton.Publication
  alias RichardBurton.Publication.Index.FlatPublication

  def all do
    Repo.all(FlatPublication)
  end
end
