defmodule RichardBurton.TranslatedBookTest do
  @moduledoc """
  Tests for the TranslatedBook schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.TranslatedBook

  @valid_attrs %{
    "authors" => "Richard Burton and Isabel Burton",
    "original_book" => %{
      authors: "J. M. Pereira da Silva",
      title: "Manuel de Moraes: crônica do século XVII"
    }
  }

  describe "changeset/2" do
    def changeset_fixture(attrs \\ %{}) do
      TranslatedBook.changeset(
        %TranslatedBook{},
        Enum.into(attrs, @valid_attrs)
      )
    end

    def translated_book_fixture(attrs \\ %{}) do
      attrs |> changeset_fixture |> Repo.insert()
    end

    test "when non-blank :authors and :original_book are provided, is valid" do
      changeset = changeset_fixture()
      assert changeset.valid?
      assert %{} = errors_on(changeset)
    end

    test "when :authors is blank, is invalid" do
      changeset = changeset_fixture(%{"authors" => ""})
      assert not changeset.valid?
      assert %{authors: ["can't be blank"]} = errors_on(changeset)
    end

    test "when :authors is nil, is invalid" do
      changeset = changeset_fixture(%{"authors" => nil})
      assert not changeset.valid?
      assert %{authors: ["can't be blank"]} = errors_on(changeset)
    end

    test "when :original_book is empty, is invalid" do
      changeset = changeset_fixture(%{"original_book" => %{}})
      assert not changeset.valid?
    end

    test "when :original_book is nil, is invalid" do
      changeset = changeset_fixture(%{"original_book" => %{}})
      assert not changeset.valid?
    end

    test "when there is a translated_book with the provided :authors and :title, is invalid" do
      {:ok, _} = translated_book_fixture(@valid_attrs)
      {:error, changeset} = translated_book_fixture(@valid_attrs)
      assert not changeset.valid?
      assert %{authors: ["has already been taken"]} = errors_on(changeset)
    end
  end

  describe("maybe_insert/1") do
    test "when there is no translated_book with the provided :authors and :original_book, inserts it" do
      assert [] = TranslatedBook.all()
      translated_book = TranslatedBook.maybe_insert!(@valid_attrs)
      assert [translated_book] == TranslatedBook.all()
    end

    test "when there is a translated_book with the provided :authors and :original_book, returns the pre-existent one" do
      translated_book_fixture()
      [translated_book] = TranslatedBook.all()
      same_translated_book = TranslatedBook.maybe_insert!(@valid_attrs)
      assert translated_book == same_translated_book
    end
  end
end
