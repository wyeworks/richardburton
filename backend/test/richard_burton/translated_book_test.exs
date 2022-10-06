defmodule RichardBurton.TranslatedBookTest do
  @moduledoc """
  Tests for the TranslatedBook schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.TranslatedBook

  @valid_attrs %{
    authors: "Richard Burton and Isabel Burton",
    original_book: %{
      authors: "J. M. Pereira da Silva",
      title: "Manuel de Moraes: crônica do século XVII"
    }
  }

  def entity do
    {%TranslatedBook{}, &TranslatedBook.changeset/2, @valid_attrs}
  end

  describe "changeset/2" do
    test "when non-blank :authors and :original_book are provided, is valid" do
      changeset = changeset_fixture()
      assert changeset.valid?
      assert %{} = errors_on(changeset)
    end

    test "when :authors is blank, is invalid", do: test_not_blank(:authors)
    test "when :authors is nil, is invalid", do: test_not_nil(:authors)

    test "when :original_book is empty, is invalid",
      do: test_invalid_attr_value(:original_book, %{})

    test "when :original_book is nil, is invalid",
      do: test_not_nil(:original_book)

    test "when a translated_book with the provided attributes exists, is invalid",
      do: test_unique_constraint(:authors)
  end

  describe("maybe_insert/1") do
    test "when there is no translated_book with the provided :authors and :original_book, inserts it" do
      assert [] = TranslatedBook.all()
      translated_book = TranslatedBook.maybe_insert!(@valid_attrs)
      assert [translated_book] == TranslatedBook.all()
    end

    test "when there is a translated_book with the provided :authors and :original_book, returns the pre-existent one" do
      entity_fixture(@valid_attrs)
      [translated_book] = TranslatedBook.all()
      same_translated_book = TranslatedBook.maybe_insert!(@valid_attrs)
      assert translated_book == same_translated_book
    end
  end
end
