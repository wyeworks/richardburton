defmodule RichardBurtonWeb.PublicationController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.Publication
  alias RichardBurton.PublicationCodec

  def index(conn, _params) do
    flat_publications = PublicationCodec.flatten(Publication.all())
    json(conn, flat_publications)
  end

  def create_all(conn, %{"_json" => entries}) do
    {status, response_body} =
      entries
      |> PublicationCodec.nest()
      |> Publication.insert_all()
      |> case do
        {:ok, publications} ->
          {:created, publications}

        {:error, {publication, :conflict}} ->
          {:conflict, publication}

        {:error, {publication, errors}} ->
          {:bad_request, %{publication: publication, errors: errors}}
      end

    conn |> put_status(status) |> json(PublicationCodec.flatten(response_body))
  end

  def validate(conn, %{"csv" => %Plug.Upload{path: path}}) do
    try do
      publications = PublicationCodec.from_csv!(path)

      result =
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
        |> PublicationCodec.flatten()

      conn
      |> put_status(:ok)
      |> json(result)
    rescue
      CSV.RowLengthError ->
        conn |> put_status(:bad_request) |> json(:incorrect_row_length)

      _ ->
        conn |> put_status(:bad_request) |> json(:invalid_format)
    end
  end
end
