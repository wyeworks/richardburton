defmodule RichardBurton.AuthorTest do
  @moduledoc """
  Tests for the Author schema
  """

  use RichardBurton.DataCase

  alias RichardBurton.Author

  @valid_attrs %{"name" => "J. M. Pereira da Silva"}

  defp changeset(attrs) do
    Author.changeset(%Author{}, attrs)
  end

  defp insert(attrs) do
    attrs |> changeset() |> Repo.insert()
  end

  defp count do
    Kernel.length(Author.all())
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
      assert %{name: :unique} == Repo.get_errors(changeset)
    end
  end

  describe "maybe_insert/1" do
    test "when there is no author with the provided name, inserts it" do
      assert 0 == count()

      author = Author.maybe_insert!(@valid_attrs)

      assert [^author] = Author.all()
      assert 1 == count()
    end

    test "when there is a author with the provided name, returns the pre-existent one" do
      insert(@valid_attrs)
      assert 1 == count()

      author = Author.maybe_insert!(@valid_attrs)

      assert [^author] = Author.all()
      assert 1 == count()
    end
  end

  describe "to_map/1" do
    test "returns the selected attributes as a map with atom keys" do
      result =
        changeset(%{"name" => "Richard Burton"})
        |> Ecto.Changeset.apply_changes()
        |> Author.to_map()

      assert %{name: "Richard Burton"} = result
    end
  end
end
