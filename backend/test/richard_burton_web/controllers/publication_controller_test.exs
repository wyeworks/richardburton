defmodule RichardBurtonWeb.PublicationControllerTest do
  @moduledoc """
  Tests for the Publication controller
  """
  use RichardBurtonWeb.ConnCase
  import Routes, only: [publication_path: 2]

  describe "POST /publications/bulk" do
    @valid_input_1 %{
      "title" => "Manuel de Moraes: A Chronicle of the Seventeenth Century",
      "country" => "GB",
      "year" => 1886,
      "publisher" => "Bickers & Son",
      "authors" => "Richard Burton, Isabel Burton",
      "original_authors" => "J. M. Pereira da Silva",
      "original_title" => "Manuel de Moraes: crônica do século XVII"
    }

    @valid_input_2 %{
      "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
      "year" => 1886,
      "country" => "GB",
      "publisher" => "Bickers & Son",
      "authors" => "Isabel Burton",
      "original_authors" => "José de Alencar",
      "original_title" => "Iracema"
    }

    @invalid_input %{
      "title" => "",
      "year" => "1886",
      "country" => "GB",
      "publisher" => "Bickers & Son",
      "authors" => "",
      "original_authors" => "José de Alencar",
      "original_title" => "Iracema"
    }

    @invalid_input_errors %{
      "title" => "required",
      "authors" => "required"
    }

    test "on success, returns 201 and the created publications", meta do
      publications = [@valid_input_1, @valid_input_2]

      input = %{"_json" => publications}

      assert publications ==
               meta.conn
               |> post(publication_path(meta.conn, :create_all), input)
               |> json_response(201)
    end

    test "on conflict, returns 409 and the conflictive publication", meta do
      publications = [@valid_input_1, @valid_input_2, @valid_input_2]

      input = %{"_json" => publications}

      assert @valid_input_2 ==
               meta.conn
               |> post(publication_path(meta.conn, :create_all), input)
               |> json_response(409)
    end

    test "on validation error, returns 409, the invalid publication and the errors", meta do
      input = %{"_json" => [@valid_input_1, @invalid_input, @valid_input_2]}

      output = %{
        "publication" => @invalid_input,
        "errors" => @invalid_input_errors
      }

      assert output ==
               meta.conn
               |> post(publication_path(meta.conn, :create_all), input)
               |> json_response(400)
    end
  end

  describe "POST /publications/validate when sending valid json" do
    @correct_input_1 %{
      "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
      "year" => "1886",
      "country" => "GB",
      "publisher" => "Bickers & Son",
      "authors" => "Isabel Burton, Richard Burton",
      "original_authors" => "José de Alencar",
      "original_title" => "Iracema"
    }
    @correct_input_2 %{
      "title" => "Ubirajara: A Legend of the Tupy Indians",
      "year" => "1922",
      "country" => "US",
      "publisher" => "Ronald Massey",
      "authors" => "J. T. W. Sadler",
      "original_authors" => "José de Alencar",
      "original_title" => "Ubirajara"
    }
    @correct_input_3 %{
      "title" => "",
      "year" => "AAAA",
      "country" => "GB",
      "publisher" => "Bickers & Son",
      "authors" => "",
      "original_authors" => "José de Alencar",
      "original_title" => "Iracema"
    }
    @correct_input_4 %{
      "title" => "Ubirajara: A Legend of the Tupy Indians",
      "year" => "",
      "country" => "",
      "publisher" => "",
      "authors" => "J. T. W. Sadler",
      "original_authors" => "",
      "original_title" => ""
    }

    @input [
      @correct_input_1,
      @correct_input_2,
      @correct_input_3,
      @correct_input_4
    ]

    @output [
      %{
        "publication" => @correct_input_1,
        "errors" => nil
      },
      %{
        "publication" => @correct_input_2,
        "errors" => nil
      },
      %{
        "publication" => @correct_input_3,
        "errors" => %{
          "year" => "integer",
          "title" => "required",
          "authors" => "required"
        }
      },
      %{
        "publication" => @correct_input_4,
        "errors" => %{
          "year" => "required",
          "country" => "required",
          "publisher" => "required",
          "original_authors" => "required",
          "original_title" => "required"
        }
      }
    ]

    test "returns 200 a list of maps with the publications an their corresponding errors", meta do
      assert @output ==
               meta.conn
               |> post(publication_path(meta.conn, :validate), %{"_json" => @input})
               |> json_response(200)
    end
  end

  describe "POST /publications/validate when sending correct csv" do
    @output [
      %{
        "publication" => %{
          "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
          "year" => "1886",
          "country" => "GB",
          "publisher" => "Bickers & Son",
          "authors" => "Isabel Burton, Richard Burton",
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
          "year" => "AAAA",
          "country" => "GB",
          "publisher" => "Bickers & Son",
          "authors" => "",
          "original_authors" => "José de Alencar",
          "original_title" => "Iracema"
        },
        "errors" => %{
          "year" => "integer",
          "title" => "required",
          "authors" => "required"
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
          "original_authors" => "required",
          "original_title" => "required"
        }
      }
    ]

    test "returns 200 and a list of maps with parsed publications and their corresponding errors",
         meta do
      input = uploaded_csv_fixture("test/fixtures/data_correct_with_errors.csv")

      assert @output ==
               meta.conn
               |> post(publication_path(meta.conn, :validate), input)
               |> json_response(200)
    end
  end

  describe "POST /publications/validate when sending incorrect csv" do
    test "on invalid escape sequence, returns 400 with invalid_escape_sequence code", meta do
      input = uploaded_csv_fixture("test/fixtures/data_incorrect_escape_sequence.csv")

      response =
        meta.conn
        |> post(publication_path(meta.conn, :validate), input)
        |> json_response(400)

      assert "invalid_escape_sequence" = response
    end
  end
end
