defmodule RichardBurtonWeb.TranslatedBookController do
  use RichardBurtonWeb, :controller
  import Ecto.Query, only: [from: 2]

  alias RichardBurton.Repo
  alias RichardBurton.TranslatedBook

  def index(conn, _params) do
    conn |> json(Repo.all(TranslatedBook))
  end
end
