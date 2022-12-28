defmodule RichardBurtonWeb.PublicationControllerTest do
  @moduledoc """
  Tests for the Publication controller
  """
  use RichardBurtonWeb.ConnCase

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

  describe "POST /publications/bulk" do
    import Routes, only: [publication_path: 2]

    test "on success, returns 201 and the created publications", meta do
      publications = [
        @valid_attrs,
        Map.put(@valid_attrs, "year", 1887),
        Map.put(@valid_attrs, "year", 1888),
        Map.put(@valid_attrs, "year", 1889),
        Map.put(@valid_attrs, "year", 1890)
      ]

      conn = post(meta.conn, publication_path(meta.conn, :create_all), %{"_json" => publications})

      assert publications == json_response(conn, 201)
    end

    test "on conflict, returns 409 and the conflictive publication", meta do
      publications = [
        @valid_attrs,
        Map.put(@valid_attrs, "year", 1887),
        Map.put(@valid_attrs, "year", 1888),
        @valid_attrs,
        Map.put(@valid_attrs, "year", 1890)
      ]

      conn = post(meta.conn, publication_path(meta.conn, :create_all), %{"_json" => publications})

      assert @valid_attrs == json_response(conn, 409)
    end

    test "on validation error, returns 409, the invalid publication and the errors", meta do
      invalid_attrs = Map.put(@valid_attrs, "year", nil)

      publications = [
        @valid_attrs,
        Map.put(@valid_attrs, "year", 1887),
        invalid_attrs,
        Map.put(@valid_attrs, "year", 1889),
        Map.put(@valid_attrs, "year", 1890)
      ]

      conn = post(meta.conn, publication_path(meta.conn, :create_all), %{"_json" => publications})

      expected_response = %{"attrs" => invalid_attrs, "errors" => %{"year" => "required"}}

      assert expected_response == json_response(conn, 400)
    end
  end
end
