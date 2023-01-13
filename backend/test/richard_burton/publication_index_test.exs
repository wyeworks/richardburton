defmodule RichardBurton.Publication.IndexTest do
  @moduledoc """
  Tests for the Publication.Index module
  """

  use RichardBurton.DataCase

  alias RichardBurton.Publication

  setup(_context) do
    {:ok, publications} = Publication.Codec.from_csv("test/fixtures/data_index.csv")

    ps =
      publications
      |> Enum.map(&insert!/1)
      |> Publication.preload()
      |> Publication.Codec.flatten()
      |> Enum.map(&Map.to_list/1)
      |> Enum.map(&Enum.map(&1, fn {k, v} -> {String.to_existing_atom(k), v} end))
      |> Enum.map(&Map.new/1)

    [publications: ps]
  end

  defp insert!(attrs) do
    %Publication{} |> Publication.changeset(attrs) |> Repo.insert!()
  end

  defp sort(publications) do
    Enum.sort(publications)
  end

  defp filter(publications, key, term) do
    Enum.filter(publications, &String.contains?(to_string(&1[key]), term))
  end

  defp select_attrs(publication, attributes) when is_map(publication) do
    Enum.filter(publication, fn {k, _} -> k in attributes end) |> Map.new()
  end

  defp select_attrs(publications, attributes) when is_list(publications) do
    Enum.map(publications, &select_attrs(&1, attributes))
  end

  describe "all/0" do
    test "retrieves all publications", context do
      %{publications: publications} = context
      {:ok, result} = Publication.Index.all()

      assert sort(publications) == sort(result)
    end
  end

  describe "all/1" do
    test "retrieves a subset of all publications attributes", context do
      %{publications: publications} = context

      attributes = [:title, :original_title, :authors]

      {:ok, result} = Publication.Index.all(select: attributes)

      assert sort(select_attrs(publications, attributes)) == sort(result)
    end
  end

  describe "search/1 with a single-word term present in the dataset" do
    test "retrieves publications by original author", context do
      %{publications: publications} = context

      term = "Verissimo"
      keyword = String.downcase(term)

      assert {:ok, result, [^keyword]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :original_authors, term)) == sort(result)
    end

    test "retrieves publications by title", context do
      %{publications: publications} = context

      term = "Night"
      keyword = String.downcase(term)

      assert {:ok, result, [^keyword]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :title, term)) == sort(result)
    end

    test "retrieves publications by original title", context do
      %{publications: publications} = context

      term = "Noite"
      keyword = String.downcase(term)

      assert {:ok, result, [^keyword]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :original_title, term)) == sort(result)
    end

    test "retrieves publications by country", context do
      %{publications: publications} = context

      term = "GB"
      keyword = String.downcase(term)

      assert {:ok, result, [^keyword]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :country, term)) == sort(result)
    end

    test "retrieves publications by author", context do
      %{publications: publications} = context

      term = "Brakel"
      keyword = String.downcase(term)

      assert {:ok, result, [^keyword]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :authors, term)) == sort(result)
    end

    test "retrieves publications by publisher", context do
      %{publications: publications} = context

      term = "Macmillan"
      keyword = String.downcase(term)

      assert {:ok, result, [^keyword]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :publisher, term)) == sort(result)
    end

    test "retrieves publications by year", context do
      %{publications: publications} = context

      term = "1956"
      keyword = String.downcase(term)

      assert {:ok, result, [^keyword]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :year, term)) == sort(result)
    end

    test "retrieves no publications and no keywords for inexistent term" do
      term = "Blablabla"

      assert {:ok, [], []} == Publication.Index.search(term)
    end
  end

  describe "search/1 with a single-word term not present in the dataset" do
    test "prioritizes words that start with the term", context do
      %{publications: publications} = context

      term = "veri"

      assert {:ok, result, ["verissimo"]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :original_authors, "Verissimo")) == sort(result)
    end

    test "does a fuzzy search when there's no words start with the term", context do
      %{publications: publications} = context

      term = "vera"

      assert {:ok, result, ["verbo"]} = Publication.Index.search(term)

      assert length(result) > 0
      assert sort(filter(publications, :original_title, "verbo")) == sort(result)
    end
  end

  describe "search/1 with a composite term present in the dataset" do
    test "retrieves publications matching any of the words", context do
      %{publications: publications} = context

      term = "Marie Barrett"
      split_term = String.split(term, " ")
      keywords = Enum.map(split_term, &String.downcase/1)

      expected =
        split_term
        |> Enum.reduce([], fn t, acc -> filter(publications, :authors, t) ++ acc end)
        |> Enum.uniq()
        |> sort

      assert {:ok, result, ^keywords} = Publication.Index.search(term)

      assert length(result) > 0
      assert expected == sort(result)
    end
  end

  describe "search/2 with a single-word term present in the dataset" do
    test "retrieves a subset of all publications attributes, by original author", context do
      %{publications: publications} = context

      term = "Verissimo"
      keyword = String.downcase(term)
      attributes = [:title, :original_title, :authors]

      assert {:ok, result, [^keyword]} = Publication.Index.search(term, select: attributes)

      expected =
        publications
        |> filter(:original_authors, term)
        |> select_attrs(attributes)
        |> sort

      assert length(result) > 0
      assert expected == sort(result)
    end
  end
end
