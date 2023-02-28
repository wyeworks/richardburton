defmodule RichardBurton.Publication.Index do
  @moduledoc """
  Interface with the searchable publication index
  """

  import Ecto.Query

  alias RichardBurton.Publication.Index.FlatPublication
  alias RichardBurton.Publication.Index.SearchDocument
  alias RichardBurton.Publication.Index.SearchKeyword
  alias RichardBurton.Repo

  def all do
    all(select: [])
  end

  def all(select: attributes) when is_list(attributes) do
    results =
      from(fp in FlatPublication)
      |> maybe_select(attributes)
      |> Repo.all()

    {:ok, results}
  end

  defp maybe_select(query, []) do
    query
  end

  defp maybe_select(query, attributes) do
    select(query, [fp], map(fp, ^attributes))
  end

  def search_keywords(term, :prefix) do
    from(w in SearchKeyword, where: ilike(w.word, ^"#{term}%"))
    |> Repo.all()
    |> Enum.map(&Map.get(&1, :word))
  end

  def search_keywords(term, :fuzzy) do
    from(
      w in SearchKeyword,
      where: fragment("similarity((?), (?)) > 0.3", w.word, ^term)
    )
    |> Repo.all()
    |> Enum.map(&Map.get(&1, :word))
  end

  def search_keywords(term) when is_binary(term) do
    case search_keywords(term, :prefix) do
      [] -> search_keywords(term, :fuzzy)
      keywords when is_list(keywords) -> keywords
    end
  end

  def search(term) do
    search(term, select: [])
  end

  def search(term, select: attributes) when is_binary(term) do
    case search_keywords(term) do
      [] ->
        {:ok, [], []}

      keywords when is_list(keywords) ->
        joint_keywords = Enum.join(keywords, " OR ")

        query =
          from(p in FlatPublication,
            join: d in SearchDocument,
            on: d.id == p.id,
            where: fragment("document @@ websearch_to_tsquery('simple', ?)", ^joint_keywords),
            order_by:
              {:desc,
               fragment(
                 "ts_rank_cd(document, websearch_to_tsquery('simple', ?), 4)",
                 ^joint_keywords
               )}
          )
          |> maybe_select(attributes)

        results =
          query
          |> Repo.all()
          |> FlatPublication.to_map()

        {:ok, results, keywords}
    end
  end
end
