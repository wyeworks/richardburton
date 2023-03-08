defmodule RichardBurton.AuthorTest do
  @moduledoc """
  Tests for the Author schema
  """

  use RichardBurton.DataCase
  import Ecto.Changeset

  alias RichardBurton.Author
  alias RichardBurton.Validation
  alias RichardBurton.OriginalBook
  alias RichardBurton.TranslatedBook

  @valid_attrs %{"name" => "J. M. Pereira da Silva"}

  @authors [
    %{"name" => "Machado de Assis"},
    %{"name" => "Richard Burton"},
    %{"name" => "Richard A. Mazzara"},
    %{"name" => "Isabel Burton"},
    %{"name" => "Clarice Lispector"}
  ]

  def search_fixture(_) do
    @authors
    |> Enum.map(&Author.changeset(%Author{}, &1))
    |> Enum.each(&Repo.insert!/1)

    []
  end

  defp changeset(attrs) do
    Author.changeset(%Author{}, attrs)
  end

  defp insert(attrs) do
    attrs |> changeset() |> Repo.insert()
  end

  defp insert!(attrs) do
    attrs |> changeset() |> Repo.insert!()
  end

  defp linked(changeset = %Ecto.Changeset{}) do
    changeset
    |> get_change(:authors)
    |> Enum.map(&apply_changes/1)
  end

  defp linked_fingerprint(changeset = %Ecto.Changeset{}) do
    get_change(changeset, :authors_fingerprint)
  end

  describe "changeset/2" do
    test "when valid attributes are provided, is valid" do
      assert changeset(@valid_attrs).valid?
    end

    test "when name is blank, is invalid" do
      refute changeset(%{"name" => ""}).valid?
    end

    test "when name is nil is invalid" do
      refute changeset(%{"name" => nil}).valid?
    end

    test "when an author with the provided attributes exist, is invalid" do
      {:ok, _} = insert(@valid_attrs)
      {:error, changeset} = insert(@valid_attrs)

      refute changeset.valid?
      assert :conflict == Validation.get_errors(changeset)
    end
  end

  describe "maybe_insert/1" do
    test "when there is no author with the provided name, inserts it" do
      author = Author.maybe_insert!(@valid_attrs)

      assert [author] == Author.all()
    end

    test "when there is a author with the provided name, returns the pre-existent one" do
      insert(@valid_attrs)
      assert [preexistent_author] = Author.all()

      author = Author.maybe_insert!(@valid_attrs)

      assert preexistent_author == author
      assert [author] == Author.all()
    end
  end

  describe "fingerprint/1" do
    test "given two different lists of authors, generates different fingerprints" do
      authors1 = [%Author{name: "Richard Burton"}, %Author{name: "Isabel Burton"}]
      authors2 = [%Author{name: "Richard Burton"}]

      refute Author.fingerprint(authors1) == Author.fingerprint(authors2)
    end

    test "given two lists of authors with the same names, generates the same fingerprints" do
      authors1 = [%Author{name: "Richard Burton"}, %Author{name: "Isabel Burton"}]
      authors2 = [%Author{name: "Richard Burton"}, %Author{name: "Isabel Burton"}]

      assert Author.fingerprint(authors1) == Author.fingerprint(authors2)
    end

    test "given two lists of authors with the same and different order, generates the same fingerprints" do
      authors1 = [%Author{name: "Isabel Burton"}, %Author{name: "Richard Burton"}]
      authors2 = [%Author{name: "Richard Burton"}, %Author{name: "Isabel Burton"}]

      assert Author.fingerprint(authors1) == Author.fingerprint(authors2)
    end
  end

  describe "link/1" do
    @original_book_attrs %{
      "title" => "Title",
      "authors" => [
        %{"name" => "Richard Burton"},
        %{"name" => "Isabel Burton"}
      ]
    }

    @translated_book_attrs %{
      "authors" => [
        %{"name" => "Richard Burton"},
        %{"name" => "Isabel Burton"}
      ],
      "original_book" => %{
        "title" => "Dom Casmurro",
        "authors" => [%{"name" => "Machado de Assis"}]
      }
    }

    test "links existing authors to OriginalBook changeset" do
      authors = Enum.map(@original_book_attrs["authors"], &insert!/1)

      changeset =
        %OriginalBook{}
        |> OriginalBook.changeset(@original_book_attrs)
        |> Author.link()

      assert changeset.valid?

      assert authors == linked(changeset)
    end

    test "links existing authors to TranslatedBook changeset" do
      authors = Enum.map(@translated_book_attrs["authors"], &insert!/1)

      changeset =
        %TranslatedBook{}
        |> TranslatedBook.changeset(@translated_book_attrs)
        |> Author.link()

      assert changeset.valid?

      assert authors == linked(changeset)
    end

    test "links non-existing authors to OriginalBook changeset, inserting them" do
      changeset =
        %OriginalBook{}
        |> OriginalBook.changeset(@original_book_attrs)
        |> Author.link()

      assert changeset.valid?

      assert Author.all() == linked(changeset)
    end

    test "links non-existing authors to TranslatedBook changeset, inserting them" do
      changeset =
        %TranslatedBook{}
        |> TranslatedBook.changeset(@translated_book_attrs)
        |> Author.link()

      assert changeset.valid?

      assert Author.all() == linked(changeset)
    end

    test "has no side effects when OriginalBook changeset is invalid" do
      changeset =
        %OriginalBook{}
        |> OriginalBook.changeset(%{})
        |> Author.link()

      refute changeset.valid?

      assert Enum.empty?(Author.all())
    end

    test "has no side effects when TranslatedBook changeset is invalid" do
      changeset =
        %TranslatedBook{}
        |> TranslatedBook.changeset(%{})
        |> Author.link()

      refute changeset.valid?

      assert Enum.empty?(Author.all())
    end
  end

  describe "link_fingerprint/1" do
    test "links fingerprint using author names to OriginalBook changeset" do
      changeset =
        %OriginalBook{}
        |> OriginalBook.changeset(@original_book_attrs)
        |> Author.link_fingerprint()

      assert changeset.valid?

      assert Author.fingerprint(linked(changeset)) == linked_fingerprint(changeset)
    end

    test "links fingerprint using author names to TranslatedBook changeset" do
      changeset =
        %TranslatedBook{}
        |> TranslatedBook.changeset(@translated_book_attrs)
        |> Author.link_fingerprint()

      assert changeset.valid?

      assert Author.fingerprint(linked(changeset)) == linked_fingerprint(changeset)
    end

    test "does not link fingerprint to invalid OriginalBook changeset" do
      changeset =
        %OriginalBook{}
        |> OriginalBook.changeset(%{})
        |> Author.link_fingerprint()

      refute changeset.valid?

      assert is_nil(linked_fingerprint(changeset))
    end

    test "does not link fingerprint to invalid TranslatedBook changeset" do
      changeset =
        %TranslatedBook{}
        |> TranslatedBook.changeset(%{})
        |> Author.link_fingerprint()

      refute changeset.valid?

      assert is_nil(linked_fingerprint(changeset))
    end
  end

  describe "search/2 when second argument is :prefix" do
    setup [:search_fixture]

    test "retrieves authors by full name" do
      term = "Machado de Assis"

      for %Author{name: name} <- Author.search(term, :prefix) do
        assert name == term
      end
    end

    test "retrieves authors by prefix" do
      term = "Richa"

      for %Author{name: name} <- Author.search(term, :prefix) do
        assert name in ["Richard Burton", "Richard A. Mazzara"]
      end
    end
  end

  describe "search/2 when second argument is :fuzzy" do
    setup [:search_fixture]

    test "retrieves authors by full name" do
      term = "Machado de Assis"

      for %Author{name: name} <- Author.search(term, :fuzzy) do
        assert name == term
      end
    end

    test "retrieves authors by similarity" do
      for %Author{name: name} <- Author.search("Machada de Assis", :fuzzy) do
        assert name == "Machado de Assis"
      end

      for %Author{name: name} <- Author.search("Richord", :fuzzy) do
        assert name in ["Richard Burton", "Richard A. Mazzara"]
      end

      for %Author{name: name} <- Author.search("Clarissa", :fuzzy) do
        assert name in ["Clarice Lispector"]
      end
    end
  end

  describe "search/1" do
    setup [:search_fixture]

    test "searches by prefix first" do
      for %Author{name: name} <- Author.search("Richard B") do
        assert name == "Richard Burton"
      end
    end

    test "searches by similarity if prefix search renders no results" do
      term = "Rochard B"

      assert [] == Author.search(term, :prefix)

      for %Author{name: name} <- Author.search(term) do
        assert name in ["Richard Burton", "Richard A. Mazzara"]
      end
    end
  end
end
