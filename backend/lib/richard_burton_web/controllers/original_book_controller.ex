defmodule RichardBurtonWeb.OriginalBookController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.OriginalBook
  alias RichardBurton.Publication

  def index(conn, %{"search" => query}) do
    json(
      conn,
      Enum.map(OriginalBook.search(query), fn %{authors: authors, title: title} ->
        %{authors: Publication.Codec.flatten_authors(authors), title: title}
      end)
    )
  end

  def index(conn, _params) do
    json(conn, OriginalBook.all())
  end
end
