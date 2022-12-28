defmodule RichardBurton.DataCase do
  @moduledoc """
  This module defines the setup for tests requiring
  access to the application's data layer.

  You may define functions here to be used as helpers in
  your tests.

  Finally, if the test case interacts with the database,
  we enable the SQL sandbox, so changes done to the database
  are reverted at the end of every test. If you are using
  PostgreSQL, you can even run database tests asynchronously
  by setting `use RichardBurton.DataCase, async: true`, although
  this option is not recommended for other databases.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      alias RichardBurton.Repo

      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import RichardBurton.DataCase

      def entity do
        raise "Not implemented"
      end

      def changeset_fixture(attrs \\ %{}) do
        {struct, changeset, valid_attrs} = entity()

        changeset.(
          struct,
          Enum.into(attrs, valid_attrs)
        )
      end

      def entity_fixture(attrs) do
        attrs |> changeset_fixture |> Repo.insert()
      end

      def test_valid_attrs() do
        changeset = changeset_fixture()
        assert changeset.valid?
        assert %{} = errors_on(changeset)
      end

      def test_invalid_attr_value(name, value, error \\ false) do
        changeset = %{} |> Map.put(name, value) |> changeset_fixture
        refute changeset.valid?, "Changeset is valid"

        if error do
          assert Map.put(%{}, name, error) == errors_on(changeset)
        end
      end

      def test_not_blank(attr),
        do: test_invalid_attr_value(attr, "", ["can't be blank"])

      def test_not_nil(attr),
        do: test_invalid_attr_value(attr, nil, ["can't be blank"])

      def test_unique_constraint(unique_constraint_name) do
        {_struct, _changeset, valid_attrs} = entity()

        {:ok, _} = entity_fixture(valid_attrs)
        {:error, changeset} = entity_fixture(valid_attrs)

        expected_errors = Map.put(%{}, unique_constraint_name, ["has already been taken"])

        refute changeset.valid?, "Changeset is valid"
        assert expected_errors == errors_on(changeset)
      end

      defoverridable entity: 0
    end
  end

  setup tags do
    RichardBurton.DataCase.setup_sandbox(tags)
    :ok
  end

  @doc """
  Sets up the sandbox based on the test tags.
  """
  def setup_sandbox(tags) do
    pid =
      Ecto.Adapters.SQL.Sandbox.start_owner!(RichardBurton.Repo,
        shared: not tags[:async]
      )

    on_exit(fn -> Ecto.Adapters.SQL.Sandbox.stop_owner(pid) end)
  end

  @doc """
  A helper that transforms changeset errors into a map of messages.

      assert {:error, changeset} = Accounts.create_user(%{password: "short"})
      assert "password is too short" in errors_on(changeset).password
      assert %{password: ["password is too short"]} = errors_on(changeset)

  """
  def errors_on(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {message, opts} ->
      Regex.replace(~r"%{(\w+)}", message, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end
