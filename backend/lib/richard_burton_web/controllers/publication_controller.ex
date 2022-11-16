defmodule RichardBurtonWeb.PublicationController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.Publication

  def index(conn, _params) do
    json(conn, Publication.all())
  end

  def create(conn, %{"_json" => entries}) do
    Publication.insert_all(entries)
    conn |> put_status(:created) |> json(%{})
  end
end