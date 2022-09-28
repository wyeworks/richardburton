defmodule Mix.Tasks.Rb.LoadData do
  @moduledoc """
  Mix task to initialize the repo using a data.csv file in the project's root directory
  """
  use Mix.Task

  alias RichardBurton.TranslatedBook

  def run(_) do
    Mix.Task.run("app.start")

    File.cwd!()
    |> Path.join('data.csv')
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
    |> Enum.map(&TranslatedBook.maybe_insert/1)
  end

  defp deserialize(row) do
    {year, _} = Integer.parse(row.year)

    original_book = %{
      title: row.original_title,
      authors: row.original_authors
    }

    %{
      title: row.title,
      authors: row.authors,
      year: year,
      country: row.country,
      publisher: row.publisher,
      original_book: original_book
    }
  end
end
