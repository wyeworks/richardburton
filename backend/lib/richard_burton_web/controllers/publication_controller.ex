defmodule RichardBurtonWeb.PublicationController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.Publication

  def index(conn, _params) do
    publications = Publication.all()
    json(conn, Publication.flatten(publications))
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

  def validate(conn, %{"csv" => %Plug.Upload{path: path}}) do
    try do
      publications = Publication.from_csv!(path)

      publications_with_errors =
        publications
        |> Enum.map(&Publication.validate/1)
        |> Enum.zip(publications)
        |> Enum.map(fn tuple ->
          case tuple do
            {{:ok}, publication} ->
              %{publication: publication, errors: nil}

            {{:error, errors}, publication} ->
              %{publication: publication, errors: errors}
          end
        end)

      conn
      |> put_status(:ok)
      |> json(publications_with_errors)
    rescue
      CSV.RowLengthError ->
        conn |> put_status(:bad_request) |> json(:incorrect_row_length)

      _ ->
        conn |> put_status(:bad_request) |> json(:invalid_format)
    end
  end
end
