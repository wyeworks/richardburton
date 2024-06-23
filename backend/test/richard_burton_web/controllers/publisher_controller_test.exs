defmodule RichardBurtonWeb.PublisherControllerTest do
  @moduledoc """
  Tests for the Publisher controller
  """
  use RichardBurtonWeb.ConnCase
  import Routes, only: [publisher_path: 2]

  alias RichardBurton.Publisher
  alias RichardBurton.Repo

  @publisher_names [
    "Random House",
    "Bantam Books",
    "Dutton",
    "UMass Dartmouth",
    "University Press of Kentucky"
  ]

  def search_fixture(_) do
    @publisher_names
    |> Enum.map(&%{"name" => &1})
    |> Enum.map(&Publisher.changeset(%Publisher{}, &1))
    |> Enum.each(&Repo.insert!/1)

    []
  end

  describe "GET /publishers" do
    setup [:search_fixture]

    test "returns 200 and all the publishers' names when no search param is provided",
         %{conn: conn} do
      expect_auth_authorize_admin()
      conn = get(conn, publisher_path(conn, :index))
      assert @publisher_names == json_response(conn, 200)
    end

    test "returns 200 and the relevant publishers' names a search param is provided",
         %{conn: conn} do
      expect_auth_authorize_admin()
      conn = get(conn, publisher_path(conn, :index), %{"search" => "U"})
      assert ["UMass Dartmouth", "University Press of Kentucky"] == json_response(conn, 200)
    end
  end
end
