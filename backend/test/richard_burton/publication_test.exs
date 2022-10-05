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

  describe "changeset/2" do
    def changeset_fixture(attrs \\ %{}) do
      Publication.changeset(
        %Publication{},
        Enum.into(attrs, @valid_attrs)
      )
    end

    def publication_fixture(attrs \\ %{}) do
      attrs |> changeset_fixture |> Repo.insert()
    end

    def test_invalid_attr_value(name, value, error \\ false) do
      changeset = %{} |> Map.put(name, value) |> changeset_fixture
      assert not changeset.valid?

      if error do
        assert Map.put(%{}, name, error) == errors_on(changeset)
      end
    end

    def test_not_blank(attr),
      do: test_invalid_attr_value(attr, "", ["can't be blank"])

    def test_not_nil(attr),
      do: test_invalid_attr_value(attr, nil, ["can't be blank"])

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

    test "when there is a publication with the provided :title, :country, :year and :publisher, is invalid" do
      {:ok, _} = publication_fixture(@valid_attrs)
      {:error, changeset} = publication_fixture(@valid_attrs)
      assert not changeset.valid?
      assert %{title: ["has already been taken"]} = errors_on(changeset)
    end
  end
end
