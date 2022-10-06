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

  @skeleton_attrs %{translated_book: %{original_book: %{}}}

  def entity do
    {%Publication{}, &Publication.changeset/2, @valid_attrs}
  end

  describe "changeset/2" do
    test "when valid attributes are provided, is valid", do: test_valid_attrs()
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

  describe "insert/1" do
    test "when inserting a duplicate publication, sreturns {:error, :conflict}" do
      {:ok, _publication} = Publication.insert(@valid_attrs)
      assert {:error, :conflict} = Publication.insert(@valid_attrs)
    end

    test "when inserting an empty publication, returns an error map with :required errors" do
      assert(
        {:error,
         %{
           title: :required,
           country: :required,
           year: :required,
           publisher: :required,
           translated_book: :required
         }} == Publication.insert(%{})
      )
    end

    test "when inserting an skeleton publication, returns a deep error map with :required errors" do
      assert(
        {:error,
         %{
           title: :required,
           country: :required,
           year: :required,
           publisher: :required,
           translated_book: %{
             authors: :required,
             original_book: %{authors: :required, title: :required}
           }
         }} == Publication.insert(@skeleton_attrs)
      )
    end
  end
end
