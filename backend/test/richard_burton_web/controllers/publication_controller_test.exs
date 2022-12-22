defmodule RichardBurtonWeb.PublicationControllerTest do
  @moduledoc """
  Tests for the Publication controller
  """
  use RichardBurtonWeb.ConnCase
  import Routes, only: [publication_path: 2]

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

  describe "POST /publications/validate" do
    test "on success, returns 200 and the parsed publications", meta do
      conn =
        post(meta.conn, publication_path(meta.conn, :validate), %{
          "csv" => uploaded_file_fixture("test/fixtures/data_valid.csv")
        })

      assert [
               %{
                 "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
                 "year" => 1886,
                 "country" => "GB",
                 "publisher" => "Bickers & Son",
                 "translated_book" => %{
                   "authors" => "Isabel Burton",
                   "original_book" => %{"authors" => "José de Alencar", "title" => "Iracema"}
                 }
               },
               %{
                 "title" => "Ubirajara: A Legend of the Tupy Indians",
                 "year" => 1922,
                 "country" => "GB",
                 "publisher" => "Ronald Massey",
                 "translated_book" => %{
                   "authors" => "J. T. W. Sadler",
                   "original_book" => %{"authors" => "José de Alencar", "title" => "Ubirajara"}
                 }
               }
             ] == json_response(conn, 200)
    end

    test "on invalid format, returns 400 with invalid_format code", meta do
      conn =
        post(meta.conn, publication_path(meta.conn, :validate), %{
          "csv" => uploaded_file_fixture("test/fixtures/data_invalid_format.csv")
        })

      assert "invalid_format" = json_response(conn, 400)
    end

    test "on invalid separator, returns 400 with incorrect_row_length code", meta do
      conn =
        post(meta.conn, publication_path(meta.conn, :validate), %{
          "csv" => uploaded_file_fixture("test/fixtures/data_invalid_separator.csv")
        })

      assert "incorrect_row_length" = json_response(conn, 400)
    end

    test "on incomplete data, returns 400 with incorrect_row_length code", meta do
      conn =
        post(meta.conn, publication_path(meta.conn, :validate), %{
          "csv" => uploaded_file_fixture("test/fixtures/data_invalid_incomplete.csv")
        })

      assert "incorrect_row_length" = json_response(conn, 400)
    end
  end
end
