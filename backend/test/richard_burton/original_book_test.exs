defmodule RichardBurton.OriginalBookTest do
  @moduledoc """
  Tests for the OriginalBook schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.Util
  alias RichardBurton.OriginalBook
  alias RichardBurton.Validation

  @valid_attrs %{
    "title" => "Manuel de Moraes: crônica do século XVII",
    "authors" => [
      %{"name" => "J. M. Pereira da Silva"},
      %{"name" => "Machado de Assis"}
    ]
  }

  @valid_attrs_atom_keys %{
    title: "Manuel de Moraes: crônica do século XVII",
    authors: [
      %{name: "J. M. Pereira da Silva"},
      %{name: "Machado de Assis"}
    ]
  }

  defp changeset(attrs = %{}) do
    OriginalBook.changeset(%OriginalBook{}, attrs)
  end

  defp change_valid(attrs = %{}) do
    changeset(Util.deep_merge_maps(@valid_attrs, attrs))
  end

  defp insert(attrs) do
    attrs |> changeset() |> Repo.insert()
  end

  describe "changeset/2" do
    test "when valid attributes are provided, is valid" do
      assert changeset(@valid_attrs).valid?
    end

    test "when title is blank, is invalid" do
      refute change_valid(%{"title" => ""}).valid?
    end

    test "when title is nil, is invalid" do
      refute change_valid(%{"title" => nil}).valid?
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

    test "when a original book with the provided attributes already exists, is invalid" do
      {:ok, _} = insert(@valid_attrs)
      {:error, changeset} = insert(@valid_attrs)

      refute changeset.valid?
      assert :conflict == Validation.get_errors(changeset)
    end
  end

  describe "maybe_insert/1" do
    test "when there is no original book with the provided authors and title, inserts it" do
      original_book = OriginalBook.maybe_insert!(@valid_attrs)

      assert [original_book] == OriginalBook.all()
    end

    test "when there is a original book with the provided authors and title, returns the pre-existent one" do
      insert(@valid_attrs)
      assert [pre_existent_book] = OriginalBook.all()

      original_book = OriginalBook.maybe_insert!(@valid_attrs) |> OriginalBook.preload()

      assert pre_existent_book == original_book
      assert [original_book] == OriginalBook.all()
    end

    test "translated books with diferrent authors must have different authors fingerprint" do
      changeset1 = change_valid(%{"authors" => [%{"name" => "Machado de Assis"}]})
      changeset2 = change_valid(%{"authors" => [%{"name" => "Erico Verissimo"}]})

      authors_fingerprint1 = Ecto.Changeset.get_field(changeset1, :authors_fingerprint)
      authors_fingerprint2 = Ecto.Changeset.get_field(changeset2, :authors_fingerprint)

      refute authors_fingerprint1 == authors_fingerprint2
    end
  end

  describe "to_map/1" do
    test "returns the selected attributes as a map with atom keys" do
      {:ok, original_book} = insert(@valid_attrs)

      assert @valid_attrs_atom_keys == OriginalBook.to_map(original_book)
    end
  end
end
