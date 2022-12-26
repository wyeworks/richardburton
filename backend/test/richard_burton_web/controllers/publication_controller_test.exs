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
    "authors" => "Richard Burton and Isabel Burton",
    "original_authors" => "J. M. Pereira da Silva",
    "original_title" => "Manuel de Moraes: crônica do século XVII"
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

  describe "POST /publications/validate when sending valid csv" do
    @output [
      %{
        "publication" => %{
          "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
          "year" => "1886",
          "country" => "GB",
          "publisher" => "Bickers & Son",
          "authors" => "Isabel Burton",
          "original_authors" => "José de Alencar",
          "original_title" => "Iracema"
        },
        "errors" => nil
      },
      %{
        "publication" => %{
          "title" => "Ubirajara: A Legend of the Tupy Indians",
          "year" => "1922",
          "country" => "US",
          "publisher" => "Ronald Massey",
          "authors" => "J. T. W. Sadler",
          "original_authors" => "José de Alencar",
          "original_title" => "Ubirajara"
        },
        "errors" => nil
      },
      %{
        "publication" => %{
          "title" => "",
          "year" => "1886",
          "country" => "GB",
          "publisher" => "Bickers & Son",
          "authors" => "",
          "original_authors" => "José de Alencar",
          "original_title" => "Iracema"
        },
        "errors" => %{
          "title" => "required",
          "translated_book" => %{
            "authors" => "required"
          }
        }
      },
      %{
        "publication" => %{
          "title" => "Ubirajara: A Legend of the Tupy Indians",
          "year" => "",
          "country" => "",
          "publisher" => "",
          "authors" => "J. T. W. Sadler",
          "original_authors" => "",
          "original_title" => ""
        },
        "errors" => %{
          "year" => "required",
          "country" => "required",
          "publisher" => "required",
          "translated_book" => %{
            "original_book" => %{
              "authors" => "required",
              "title" => "required"
            }
          }
        }
      }
    ]

    test "returns 200 and a list of maps with parsed publications and their corresponding errors",
         meta do
      input = uploaded_csv_fixture("test/fixtures/data_valid_mixed.csv")

      assert @output ==
               meta.conn
               |> post(publication_path(meta.conn, :validate), input)
               |> json_response(200)
    end
  end

  describe "POST /publications/validate when sending invalid csv" do
    test "on invalid format, returns 400 with invalid_format code", meta do
      input = uploaded_csv_fixture("test/fixtures/data_invalid_format.csv")

      response =
        meta.conn
        |> post(publication_path(meta.conn, :validate), input)
        |> json_response(400)

      assert "invalid_format" = response
    end

    test "on invalid separator, returns 400 with incorrect_row_length code", meta do
      input = uploaded_csv_fixture("test/fixtures/data_invalid_separator.csv")

      response =
        meta.conn
        |> post(publication_path(meta.conn, :validate), input)
        |> json_response(400)

      assert "incorrect_row_length" = response
    end

    test "on incomplete data, returns 400 with incorrect_row_length code", meta do
      input = uploaded_csv_fixture("test/fixtures/data_invalid_incomplete.csv")

      response =
        meta.conn
        |> post(publication_path(meta.conn, :validate), input)
        |> json_response(400)

      assert "incorrect_row_length" = response
    end
  end
end
