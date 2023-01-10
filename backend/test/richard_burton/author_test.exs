defmodule RichardBurton.AuthorTest do
  @moduledoc """
  Tests for the Author schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.Author
  alias RichardBurton.Validation

  @valid_attrs %{"name" => "J. M. Pereira da Silva"}

  defp changeset(attrs) do
    Author.changeset(%Author{}, attrs)
  end

  defp insert(attrs) do
    attrs |> changeset() |> Repo.insert()
  end

  describe "changeset/2" do
    test "when valid attributes are provided, is valid" do
      assert changeset(@valid_attrs).valid?
    end

    test "when name is blank, is invalid" do
      refute changeset(%{"name" => ""}).valid?
    end

    test "when name is nil is invalid" do
      refute changeset(%{"name" => nil}).valid?
    end

    test "when an author with the provided attributes exist, is invalid" do
      {:ok, _} = insert(@valid_attrs)
      {:error, changeset} = insert(@valid_attrs)

      refute changeset.valid?
      assert :conflict == Validation.get_errors(changeset)
    end
  end

  describe "maybe_insert/1" do
    test "when there is no author with the provided name, inserts it" do
      author = Author.maybe_insert!(@valid_attrs)

      assert [author] == Author.all()
    end

    test "when there is a author with the provided name, returns the pre-existent one" do
      insert(@valid_attrs)
      assert [preexistent_author] = Author.all()

      author = Author.maybe_insert!(@valid_attrs)

      assert preexistent_author.id == author.id
      assert [author] == Author.all()
    end
  end

  describe "to_map/1" do
    test "returns the selected attributes as a map with atom keys" do
      result =
        changeset(%{"name" => "Richard Burton"})
        |> Ecto.Changeset.apply_changes()
        |> Author.to_map()

      assert %{name: "Richard Burton"} == result
    end
  end
end
