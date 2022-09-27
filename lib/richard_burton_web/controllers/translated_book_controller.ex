defmodule RichardBurtonWeb.TranslatedBookController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.TranslatedBook

  def index(conn, _params) do
    json(conn, TranslatedBook.all())
  end
end
