defmodule RichardBurtonWeb.PublicationController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.Publication

  def index(conn, %{"search" => query}) do
    {:ok, results, keywords} = Publication.Index.search(query)
    json(conn, %{entries: results, keywords: keywords})
  end

  def index(conn, _params) do
    {:ok, results} = Publication.Index.all()
    json(conn, %{entries: results})
  end

  def create_all(conn, %{"_json" => entries}) do
    {status, response_body} =
      entries
      |> Publication.Codec.nest()
      |> Publication.insert_all()
      |> case do
        {:ok, publications} ->
          {:created, publications}

        {:error, {publication, :conflict}} ->
          {:conflict, publication}

        {:error, {publication, errors}} ->
          {:bad_request, %{publication: publication, errors: errors}}
      end

    conn |> put_status(status) |> json(Publication.Codec.flatten(response_body))
  end

  def validate(conn, %{"csv" => %Plug.Upload{path: path}}) do
    case Publication.Codec.from_csv(path) do
      {:ok, publications} ->
        result =
          publications
          |> Enum.map(&validate_publication/1)
          |> Publication.Codec.flatten()

        conn
        |> put_status(:ok)
        |> json(result)

      {:error, reason} ->
        conn |> put_status(:bad_request) |> json(reason)
    end
  end

  def validate(conn, %{"_json" => publications}) do
    result =
      publications
      |> Publication.Codec.nest()
      |> Enum.map(&validate_publication/1)
      |> Publication.Codec.flatten()

    conn
    |> put_status(:ok)
    |> json(result)
  end

  defp validate_publication(p) do
    case Publication.validate(p) do
      :ok -> %{publication: p, errors: nil}
      {:error, errors} -> %{publication: p, errors: errors}
    end
  end
end
