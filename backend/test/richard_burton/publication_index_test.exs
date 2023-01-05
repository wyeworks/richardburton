defmodule RichardBurton.Publication.IndexTest do
  @moduledoc """
  Tests for the Publication.Index module
  """

  use ExUnit.Case

  alias RichardBurton.Publication

  setup_all :load_data

  def load_data(_context) do
    pid = Ecto.Adapters.SQL.Sandbox.start_owner!(RichardBurton.Repo, shared: true)

    File.cwd!()
    |> Path.join("test/fixtures/data.csv")
    |> Publication.Codec.from_csv()
    |> case do
      {:ok, publications} -> Enum.each(publications, &Publication.insert/1)
      {:error, error} -> IO.puts("Operation failed with error #{error}")
    end

    on_exit(fn -> Ecto.Adapters.SQL.Sandbox.stop_owner(pid) end)
    :ok
  end

  describe "all/0" do
    test "returns all publications" do
      assert 266 = Kernel.length(Publication.Index.all())
    end
  end
end
