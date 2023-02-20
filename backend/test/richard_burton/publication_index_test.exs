defmodule RichardBurton.Publication.IndexTest do
  @moduledoc """
  Tests for the Publication.Index module
  """

  use RichardBurton.DataCase

  alias RichardBurton.Publication
  alias RichardBurton.Util

  setup(_context) do
    {:ok, publications} = Publication.Codec.from_csv("test/fixtures/data_index.csv")
    Enum.map(publications, &insert!/1)
    []
  end

  defp insert!(attrs) do
    %Publication{} |> Publication.changeset(attrs) |> Repo.insert!()
  end

  defp assert_search_results(publications, expected_values)
       when is_list(publications) and is_list(expected_values) do
    unless Keyword.keyword?(expected_values) do
      throw(
        "Expected values must be defined as a keyword with attribute as key and expected values as value"
      )
    end

    refute Enum.empty?(publications), "Expected publications not to be empty."

    Enum.each(publications, fn p ->
      assert Enum.any?(expected_values, fn {key, value} ->
               String.contains?(inspect(p[key]), value)
             end),
             """
             Expected publication

             #{inspect(p, pretty: true)}

             to meet one of the following conditions:

             #{Enum.map_join(expected_values, "", fn
               {key, [v]} -> """
                 #{key} contains #{inspect(v, pretty: true)}
                 """
               {key, v} when is_list(v) -> """
                 #{key} contains one of #{inspect(v, pretty: true)}
                 """
               {key, v} -> """
                 #{key} contains #{inspect(v, pretty: true)}
                 """
             end)}
             """
    end)
  end

  describe "all/0" do
    test "returns all publications flattened" do
      {:ok, actual} = Publication.Index.all()

      expected =
        Publication.all()
        |> Publication.preload()
        |> Publication.Codec.flatten()

      assert Enum.sort(Util.stringify_keys(actual)) == Enum.sort(expected)
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
        original_authors: expected_original_authors
      )
    end

    test "retrieves publications by title" do
      term = "Night"
      keyword = String.downcase(term)
      expected_titles = ["Night"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        title: expected_titles
      )
    end

    test "retrieves publications by original title" do
      term = "Noite"
      keyword = String.downcase(term)
      expected_original_titles = ["Noite"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        original_title: expected_original_titles
      )
    end

    test "retrieves publications by country" do
      term = "GB"
      keyword = String.downcase(term)
      expected_countries = ["GB"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        country: expected_countries
      )
    end

    test "retrieves publications by author" do
      term = "Brakel"
      keyword = String.downcase(term)
      expected_authors = ["Arthur Brakel"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        authors: expected_authors
      )
    end

    test "retrieves publications by publisher" do
      term = "Macmillan"
      keyword = String.downcase(term)
      expected_publishers = ["Macmillan"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        publisher: expected_publishers
      )
    end

    test "retrieves publications by year" do
      term = "1956"
      keyword = String.downcase(term)
      expected_years = ["1956"]

      assert {:ok, publications, [^keyword]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        year: expected_years
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
        original_authors: ["Erico Verissimo", "Luis Fernando Verissimo"]
      )
    end

    test "does a fuzzy search when there's no words start with the term" do
      term = "vera"

      assert {:ok, publications, ["verbo"]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        original_title: ["Amar verbo intransitivo"]
      )
    end
  end

  describe "search/1 with a single-word term that matches several fields" do
    test "does a prefix search" do
      term = "Mari"

      assert {:ok, publications, ["marie", "marias"]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        title: "The Three Marias",
        authors: "Marie Barrett",
        original_title: "As três Marias"
      )
    end

    test "does a fuzzy search" do
      term = "Maries"

      assert {:ok, publications, ["marie", "marias"]} = Publication.Index.search(term)

      assert_search_results(
        publications,
        title: "The Three Marias",
        authors: "Marie Barrett",
        original_title: "As três Marias"
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
        authors: ["Linton Lemos Barrett", "Marie Barrett"]
      )
    end
  end
end
