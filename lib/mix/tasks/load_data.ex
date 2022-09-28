defmodule Mix.Tasks.Rb.LoadData do
  @moduledoc """
  Mix task to initialize the repo using a data.csv file in the project's root directory
  """
  use Mix.Task

  alias RichardBurton.Repo
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
    |> insert_all_in_transaction
  end

  defp deserialize(row) do
    {year, _} = Integer.parse(row.year)

    %TranslatedBook{
      title: row.title,
      authors: row.authors,
      year: year,
      country: row.country,
      publisher: row.publisher,
      original_title: row.original_title,
      original_authors: row.original_authors
    }
  end

  defp insert_all(entries), do: Enum.map(entries, fn entry -> Repo.insert(entry) end)
  defp insert_all_in_transaction(entries), do: Repo.transaction(fn -> insert_all(entries) end)
end
