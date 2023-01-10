defmodule RichardBurton.TranslatedBookTest do
  @moduledoc """
  Tests for the TranslatedBook schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.TranslatedBook
  alias RichardBurton.Util
  alias RichardBurton.Validation

  @valid_attrs %{
    "authors" => [
      %{"name" => "Richard Burton"},
      %{"name" => "Isabel Burton"}
    ],
    "original_book" => %{
      "title" => "Manuel de Moraes: crônica do século XVII",
      "authors" => [
        %{"name" => "J. M. Pereira da Silva"}
      ]
    }
  }

  @valid_attrs_atom_keys %{
    authors: [
      %{name: "Richard Burton"},
      %{name: "Isabel Burton"}
    ],
    original_book: %{
      title: "Manuel de Moraes: crônica do século XVII",
      authors: [
        %{name: "J. M. Pereira da Silva"}
      ]
    }
  }

  defp changeset(attrs = %{}) do
    TranslatedBook.changeset(%TranslatedBook{}, attrs)
  end

  defp change_valid(attrs = %{}) do
    changeset(Util.deep_merge_maps(@valid_attrs, attrs))
  end

  defp insert(attrs) do
    attrs |> changeset() |> Repo.insert()
  end

  defp count do
    Kernel.length(TranslatedBook.all())
  end

  describe "changeset/2" do
    test "when valid attributes are provided, is valid" do
      assert changeset(@valid_attrs).valid?
    end

    test "when authors is missing, is invalid" do
      refute changeset(Map.delete(@valid_attrs, "authors")).valid?
    end

    test "when authors is nil, is invalid" do
      refute change_valid(%{"authors" => nil}).valid?
    end

    test "when authors is empty, is invalid" do
      refute change_valid(%{"authors" => []}).valid?
    end

    test "when an author is invalid, is invalid" do
      refute change_valid(%{"authors" => [%{"name" => nil}]}).valid?
    end

    test "when original book is missing, is invalid" do
      refute changeset(Map.delete(@valid_attrs, "original_book")).valid?
    end

    test "when original book is invalid, is invalid" do
      refute change_valid(%{"original_book" => %{"title" => nil}}).valid?
    end

    test "when original book is nil, is invalid" do
      refute change_valid(%{"original_book" => nil}).valid?
    end

    test "when a translated book with the provided attributes already exists, is invalid" do
      {:ok, _} = insert(@valid_attrs)
      {:error, changeset} = insert(@valid_attrs)

      refute changeset.valid?
      assert :conflict == Validation.get_errors(changeset)
    end

    test "translated books with diferrent authors must have different authors fingerprint" do
      changeset1 = change_valid(%{"authors" => [%{"name" => "John Gledson"}]})
      changeset2 = change_valid(%{"authors" => [%{"name" => "Helen Caldwell"}]})

      authors_fingerprint1 = Ecto.Changeset.get_field(changeset1, :authors_fingerprint)
      authors_fingerprint2 = Ecto.Changeset.get_field(changeset2, :authors_fingerprint)

      refute authors_fingerprint1 == authors_fingerprint2
    end
  end

  describe "maybe_insert/1" do
    test "when there is no translated book with the provided authors and original book, inserts it" do
      assert 0 == count()

      translated_book = TranslatedBook.maybe_insert!(@valid_attrs)

      assert [translated_book] == TranslatedBook.all()
      assert 1 == count()
    end

    test "when there is a translated book with the provided authors and original book, returns the pre-existent one" do
      insert(@valid_attrs)
      assert 1 == count()

      translated_book = TranslatedBook.maybe_insert!(@valid_attrs) |> TranslatedBook.preload()

      assert [translated_book] == TranslatedBook.all()
      assert 1 == count()
    end
  end

  describe "to_map/1" do
    test "returns the selected attributes as a map with atom keys" do
      {:ok, translated_book} = insert(@valid_attrs)

      assert @valid_attrs_atom_keys == TranslatedBook.to_map(translated_book)
    end
  end
end
