defmodule RichardBurtonWeb.AuthorController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.Author

  def index(conn, %{"search" => query}) do
    json(conn, Enum.map(Author.search(query), &Map.get(&1, :name)))
  end

  def index(conn, _params) do
    json(conn, Enum.map(Author.all(), &Map.get(&1, :name)))
  end
end
