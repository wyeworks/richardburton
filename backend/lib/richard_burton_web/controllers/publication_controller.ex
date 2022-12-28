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

  def validate(conn, %{"csv" => %Plug.Upload{path: path}}) do
    try do
      publications_with_errors =
        path
        |> Publication.from_csv!()
        |> Enum.map(fn p ->
          case(Publication.validate(p)) do
            {:ok} -> %{publication: p, errors: nil}
            {:error, errors} -> %{publication: p, errors: errors}
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
