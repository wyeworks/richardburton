defmodule RichardBurton.PublicationTest do
  @moduledoc """
  Tests for the Publication schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.Publication

  @valid_attrs %{
    title: "Manuel de Moraes: A Chronicle of the Seventeenth Century",
    country: "GB",
    year: 1886,
    publisher: "Bickers & Son",
    translated_book: %{
      authors: "Richard Burton and Isabel Burton",
      original_book: %{
        authors: "J. M. Pereira da Silva",
        title: "Manuel de Moraes: crônica do século XVII"
      }
    }
  }

  def entity do
    {%Publication{}, &Publication.changeset/2, @valid_attrs}
  end

  describe "changeset/2" do
    test "when non-blank :title, :country, :year, :publisher and :translated_book are provided, is valid" do
      changeset = changeset_fixture()
      assert changeset.valid?
      assert %{} = errors_on(changeset)
    end

    test "when :title is blank, is invalid", do: test_not_blank(:title)
    test "when :title is nil, is invalid", do: test_not_nil(:title)
    test "when :country is blank, is invalid", do: test_not_blank(:country)
    test "when :country is nil, is invalid", do: test_not_nil(:country)
    test "when :publisher is blank, is invalid", do: test_not_blank(:publisher)
    test "when :publisher is nil, is invalid", do: test_not_nil(:publisher)
    test "when :year is nil, is invalid", do: test_not_nil(:year)

    test "when :translated_book is empty, is invalid",
      do: test_invalid_attr_value(:translated_book, %{})

    test "when :translated_book is nil, is invalid",
      do: test_not_nil(:translated_book)

    test "when a publication with the provided attributes exists, is invalid",
      do: test_unique_constraint(:title)
  end
end
