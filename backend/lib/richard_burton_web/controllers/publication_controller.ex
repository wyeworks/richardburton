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

  def create_all(conn, %{"csv" => %Plug.Upload{path: path}}) do
    publications =
      path
      |> File.stream!()
      |> CSV.decode!(
        separator: ?;,
        headers: [
          :original_authors,
          :year,
          :country,
          :original_title,
          :title,
          :authors,
          :publisher
        ]
      )
      |> Enum.map(&deserialize/1)

    conn |> put_status(:ok) |> json(publications)
  end

  defp deserialize(row) do
    {year, _} = Integer.parse(row.year)

    %{
      "title" => row.title,
      "year" => year,
      "country" => row.country,
      "publisher" => row.publisher,
      "translated_book" => %{
        "authors" => row.authors,
        "original_book" => %{
          "title" => row.original_title,
          "authors" => row.original_authors
        }
      }
    }
  end
end
