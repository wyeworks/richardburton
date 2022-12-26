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
          {:created, PublicationCodec.flatten(publications)}

        {:error, {attrs, :conflict}} ->
          {:conflict, PublicationCodec.flatten(attrs)}

        {:error, {attrs, errors}} ->
          {:bad_request, %{attrs: PublicationCodec.flatten(attrs), errors: errors}}
      end

    conn |> put_status(status) |> json(response_body)
  end

  def validate(conn, %{"csv" => %Plug.Upload{path: path}}) do
    try do
      publications = PublicationCodec.from_csv!(path)

      publications_with_errors =
        publications
        |> Enum.map(&Publication.validate/1)
        |> Enum.zip(PublicationCodec.flatten(publications))
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
