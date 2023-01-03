defmodule RichardBurton.PublicationTest do
  @moduledoc """
  Tests for the Publication schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.Publication

  @valid_attrs %{
    "title" => "Manuel de Moraes: A Chronicle of the Seventeenth Century",
    "country" => "GB",
    "year" => 1886,
    "publisher" => "Bickers & Son",
    "translated_book" => %{
      "authors" => "Richard Burton and Isabel Burton",
      "original_book" => %{
        "authors" => "J. M. Pereira da Silva",
        "title" => "Manuel de Moraes: crônica do século XVII"
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
    test "when title is blank, is invalid", do: test_not_blank("title")
    test "when title is nil, is invalid", do: test_not_nil("title")
    test "when country is blank, is invalid", do: test_not_blank("country")
    test "when country is nil, is invalid", do: test_not_nil("country")
    test "when publisher is blank, is invalid", do: test_not_blank("publisher")
    test "when publisher is nil, is invalid", do: test_not_nil("publisher")
    test "when year is nil, is invalid", do: test_not_nil("year")

    test "when translated_book is empty, is invalid",
      do: test_invalid_attr_value("translated_book", %{})

    test "when translated_book is nil, is invalid",
      do: test_not_nil("translated_book")

    test "when a publication with the provided attributes exists, is invalid",
      do: test_unique_constraint(:title)
  end

  describe "insert/1" do
    import Publication, only: [insert: 1]

    test "when inserting valid publications, returns {:ok, publication}" do
      result = insert(@valid_attrs)
      [p] = Publication.all()
      assert {:ok, p} == result
    end

    test "when inserting a duplicate publication, returns {:error, :conflict}" do
      {:ok, _publication} = entity_fixture(@valid_attrs)
      assert {:error, :conflict} == insert(@valid_attrs)
    end

    test "when inserting an empty publication, returns an error map with :required errors" do
      assert {:error, @empty_attrs_error_map} == insert(@empty_attrs)
    end

    test "when inserting an skeleton publication, returns a deep error map with :required errors" do
      assert {:error, @skeleton_attrs_error_map} == insert(@skeleton_attrs)
    end
  end

  describe "validate/1" do
    import Publication, only: [validate: 1]

    test "when validating valid publications, returns {:ok, publication}" do
      # Insert a dummy publication to make sure the test passes on a non-empty database
      {:ok, _publication} = entity_fixture(Map.put(@valid_attrs, "title", "New title"))
      assert {:ok, @valid_attrs} == validate(@valid_attrs)
    end

    test "when validating a duplicate publication, returns {:error, :conflict}" do
      {:ok, _publication} = entity_fixture(@valid_attrs)
      assert {:error, :conflict} = validate(@valid_attrs)
    end

    test "when validating an empty publication, returns an error map with :required errors" do
      assert {:error, @empty_attrs_error_map} == validate(@empty_attrs)
    end

    test "when validating an skeleton publication, returns a deep error map with :required errors" do
      assert {:error, @skeleton_attrs_error_map} == validate(@skeleton_attrs)
    end
  end

  describe "insert_all/1" do
    import Publication, only: [insert_all: 1]

    test "when many valid publications are provided, inserts them" do
      assert [] == Publication.all()

      {:ok, publications} =
        insert_all([
          @valid_attrs,
          Map.put(@valid_attrs, "year", 1887),
          Map.put(@valid_attrs, "year", 1888),
          Map.put(@valid_attrs, "year", 1889),
          Map.put(@valid_attrs, "year", 1890)
        ])

      preloaded_publications = Repo.preload(publications, translated_book: [:original_book])

      assert preloaded_publications == Publication.all()
    end

    test "when invalid publications are provided, rolls back and returns the first error" do
      assert [] == Publication.all()

      {:error, description} =
        insert_all([
          @valid_attrs,
          @valid_attrs,
          Map.put(@valid_attrs, "year", 1888),
          Map.put(@valid_attrs, "year", 1889),
          Map.put(@valid_attrs, "year", 1890)
        ])

      assert {@valid_attrs, :conflict} = description

      {:error, description} =
        insert_all([
          @valid_attrs,
          Map.put(@valid_attrs, "year", 1888),
          @skeleton_attrs,
          Map.put(@valid_attrs, "year", 1889),
          Map.put(@valid_attrs, "year", 1890)
        ])

      assert {@skeleton_attrs, @skeleton_attrs_error_map} == description

      assert [] == Publication.all()
    end
  end
end
