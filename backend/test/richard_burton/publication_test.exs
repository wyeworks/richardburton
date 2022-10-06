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

  @empty_attrs %{}
  @skeleton_attrs %{translated_book: %{original_book: %{}}}

  @empty_attrs_error_map %{
    title: :required,
    country: :required,
    year: :required,
    publisher: :required,
    translated_book: :required
  }

  @skeleton_attrs_error_map %{
    title: :required,
    country: :required,
    year: :required,
    publisher: :required,
    translated_book: %{
      authors: :required,
      original_book: %{authors: :required, title: :required}
    }
  }

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
    import Publication, only: [insert: 1]

    test "when inserting valid publications, returns {:ok, publication}" do
      assert({:ok, @valid_attrs} = insert(@valid_attrs))
    end

    test "when inserting a duplicate publication, returns {:error, :conflict}" do
      {:ok, _publication} = entity_fixture(@valid_attrs)
      assert {:error, :conflict} = insert(@valid_attrs)
    end

    test "when inserting an empty publication, returns an error map with :required errors" do
      assert({:error, @empty_attrs_error_map} == insert(@empty_attrs))
    end

    test "when inserting an skeleton publication, returns a deep error map with :required errors" do
      assert({:error, @skeleton_attrs_error_map} == insert(@skeleton_attrs))
    end
  end

  describe "validate/1" do
    import Publication, only: [validate: 1]

    test "when validating valid publications, returns {:ok, publication}" do
      assert({:ok} = validate(@valid_attrs))
    end

    test "when validating a duplicate publication, returns {:error, :conflict}" do
      {:ok, _publication} = entity_fixture(@valid_attrs)
      assert {:error, :conflict} = validate(@valid_attrs)
    end

    test "when validating an empty publication, returns an error map with :required errors" do
      assert({:error, @empty_attrs_error_map} == validate(@empty_attrs))
    end

    test "when validating an skeleton publication, returns a deep error map with :required errors" do
      assert({:error, @skeleton_attrs_error_map} == validate(@skeleton_attrs))
    end
  end
end
