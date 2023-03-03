defmodule RichardBurtonWeb.AuthorController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.Author

  def index(conn, _params) do
    json(conn, Author.all())
  end
end
