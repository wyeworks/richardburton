defmodule RichardBurtonWeb.PublicationController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.Publication

  def index(conn, _params) do
    json(conn, Publication.all())
  end

  def create_all(conn, %{"_json" => entries}) do
    {status, response_body} =
      entries
      |> Publication.insert_all()
      |> case do
        {:ok, publications} ->
          {:created, publications}

        {:error, {attrs, :conflict}} ->
          {:conflict, attrs}

        {:error, {attrs, errors}} ->
          {:bad_request, %{attrs: attrs, errors: errors}}
      end

    conn |> put_status(status) |> json(response_body)
  end
end
