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
      |> Enum.map(&Map.new(&1, fn {k, v} -> {String.to_existing_atom(k), v} end))

    [publications: ps]
  end

  defp insert!(attrs) do
    %Publication{} |> Publication.changeset(attrs) |> Repo.insert!()
  end

  defp sort(publications) do
    Enum.sort(publications)
  end

  defp assert_search_results(publications, key, expected_values)
       when is_list(publications) and is_atom(key) and is_list(expected_values) do
    refute Enum.empty?(publications), "Expected publications not to be empty."

    Enum.each(publications, fn p ->
      assert Enum.any?(expected_values, &String.contains?(inspect(p[key]), &1)),
             """
             Expected publication

             #{inspect(p, pretty: true)}

             to have #{key} containing one of the following values:

             #{inspect(expected_values)}
             """
    end)
  end

  describe "all/0" do
    test "returns all publications", context do
      %{publications: publications} = context
      {:ok, result} = Publication.Index.all()

      assert sort(publications) == sort(result)
    end
  end

  describe "search/1 with a single-word term present in the dataset" do
    test "retrieves publications by original author" do
      term = "Verissimo"
      keyword = String.downcase(term)
      expected_original_authors = ["Erico Verissimo", "Luis Fernando Verissimo"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :original_authors,
        expected_original_authors
      )
    end

    test "retrieves publications by title" do
      term = "Night"
      keyword = String.downcase(term)
      expected_titles = ["Night"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :title,
        expected_titles
      )
    end

    test "retrieves publications by original title" do
      term = "Noite"
      keyword = String.downcase(term)
      expected_original_titles = ["Noite"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :original_title,
        expected_original_titles
      )
    end

    test "retrieves publications by country" do
      term = "GB"
      keyword = String.downcase(term)
      expected_countries = ["GB"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :country,
        expected_countries
      )
    end

    test "retrieves publications by author" do
      term = "Brakel"
      keyword = String.downcase(term)
      expected_authors = ["Arthur Brakel"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :authors,
        expected_authors
      )
    end

    test "retrieves publications by publisher" do
      term = "Macmillan"
      keyword = String.downcase(term)
      expected_publishers = ["Macmillan"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :publisher,
        expected_publishers
      )
    end

    test "retrieves publications by year" do
      term = "1956"
      keyword = String.downcase(term)
      expected_years = ["1956"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :year,
        expected_years
      )
    end

    test "retrieves no publications and no keywords for inexistent term" do
      term = "Blablabla"

      assert {:ok, [], []} == Publication.Index.search(term)
    end
  end

  describe "search/1 with a single-word term not present in the dataset" do
    test "prioritizes words that start with the term" do
      term = "veri"

      assert {:ok, publications, ["verissimo"]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :original_authors,
        ["Erico Verissimo", "Luis Fernando Verissimo"]
      )
    end

    test "does a fuzzy search when there's no words start with the term" do
      term = "vera"

      assert {:ok, publications, ["verbo"]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :original_title,
        ["Amar verbo intransitivo"]
      )
    end
  end

  describe "search/1 with a composite term present in the dataset" do
    test "retrieves publications matching any of the words" do
      term = "Marie Barrett"
      split_term = String.split(term, " ")
      keywords = Enum.map(split_term, &String.downcase/1)

      assert {:ok, publications, ^keywords} = Publication.Index.search(term)

      assert_search_results(
        publications,
        :authors,
        ["Linton Lemos Barrett", "Marie Barrett"]
      )
    end
  end
end
