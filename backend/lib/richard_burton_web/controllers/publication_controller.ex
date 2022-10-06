defmodule RichardBurtonWeb.PublicationController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.Publication

  def index(conn, _params) do
    json(conn, Publication.all())
  end

  def create_all(conn, %{"_json" => entries}) do
    Enum.each(entries, &Publication.insert/1)
    conn |> put_status(:created) |> json(%{})
  end
end
