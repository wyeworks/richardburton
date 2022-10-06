defmodule RichardBurton.OriginalBookTest do
  @moduledoc """
  Tests for the OriginalBook schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.OriginalBook

  @valid_attrs %{
    authors: "J. M. Pereira da Silva",
    title: "Manuel de Moraes: crônica do século XVII"
  }

  def entity do
    {%OriginalBook{}, &OriginalBook.changeset/2, @valid_attrs}
  end

  describe "changeset/2" do
    def original_book_fixture(attrs \\ %{}) do
      attrs |> changeset_fixture |> Repo.insert()
    end

    test "when non-blank :authors and :title are provided, is valid" do
      changeset = changeset_fixture()
      assert changeset.valid?
      assert %{} = errors_on(changeset)
    end

    test "when :authors is blank, is invalid", do: test_not_blank(:authors)
    test "when :authors is nil, is invalid", do: test_not_nil(:authors)
    test "when :title is blank, is invalid", do: test_not_blank(:title)
    test "when :title is nil, is invalid", do: test_not_nil(:title)

    test "when a original_book with the provided attributes exists, is invalid",
      do: test_unique_constraint(:authors)
  end

  describe("maybe_insert/1") do
    test "when there is no original_book with the provided :authors and :title, inserts it" do
      assert [] = Repo.all(OriginalBook)
      original_book = OriginalBook.maybe_insert!(@valid_attrs)
      assert [original_book] == Repo.all(OriginalBook)
    end

    test "when there is a original_book with the provided :authors and :title, returns the pre-existent one" do
      original_book_fixture()
      [original_book] = Repo.all(OriginalBook)
      same_original_book = OriginalBook.maybe_insert!(@valid_attrs)
      assert original_book == same_original_book
    end
  end
end
