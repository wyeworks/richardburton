defmodule RichardBurton.PublicationCodecTest do
  @moduledoc """
  Tests for the PublicationCodec module
  """

  use RichardBurton.DataCase

  alias RichardBurton.PublicationCodec
  alias RichardBurton.Publication
  alias RichardBurton.TranslatedBook
  alias RichardBurton.OriginalBook

  describe "from_csv!/1 when the provided csv is valid" do
    @output [
      %{
        "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
        "year" => "1886",
        "country" => "GB",
        "publisher" => "Bickers & Son",
        "translated_book" => %{
          "authors" => "Isabel Burton",
          "original_book" => %{
            "authors" => "José de Alencar",
            "title" => "Iracema"
          }
        }
      },
      %{
        "title" => "Ubirajara: A Legend of the Tupy Indians",
        "year" => "1922",
        "country" => "US",
        "publisher" => "Ronald Massey",
        "translated_book" => %{
          "authors" => "J. T. W. Sadler",
          "original_book" => %{
            "authors" => "José de Alencar",
            "title" => "Ubirajara"
          }
        }
      },
      %{
        "title" => "",
        "year" => "1886",
        "country" => "GB",
        "publisher" => "Bickers & Son",
        "translated_book" => %{
          "authors" => "",
          "original_book" => %{
            "authors" => "José de Alencar",
            "title" => "Iracema"
          }
        }
      },
      %{
        "title" => "Ubirajara: A Legend of the Tupy Indians",
        "year" => "",
        "country" => "",
        "publisher" => "",
        "translated_book" => %{
          "authors" => "J. T. W. Sadler",
          "original_book" => %{
            "authors" => "",
            "title" => ""
          }
        }
      }
    ]

    test "when the provided csv file is valid, returns a list of publication-like maps" do
      assert @output == PublicationCodec.from_csv!("test/fixtures/data_valid_mixed.csv")
    end
  end

  describe "from_csv!/1 when the provided csv is invalid" do
    test "because it has an incorrect format, raise an error" do
      input = "test/fixtures/data_invalid_format.csv"
      assert_raise RuntimeError, fn -> PublicationCodec.from_csv!(input) end
    end

    test "because it has an invalid separator, raise an error" do
      input = "test/fixtures/data_invalid_separator.csv"
      assert_raise CSV.RowLengthError, fn -> PublicationCodec.from_csv!(input) end
    end

    test "because it is incomplete, raise an error" do
      input = "test/fixtures/data_invalid_incomplete.csv"
      assert_raise CSV.RowLengthError, fn -> PublicationCodec.from_csv!(input) end
    end
  end

  describe "flatten/1" do
    @output %{
      "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
      "year" => "1886",
      "country" => "GB",
      "publisher" => "Bickers & Son",
      "authors" => "Isabel Burton",
      "original_authors" => "José de Alencar",
      "original_title" => "Iracema"
    }

    test "on a nested publication-like with string keys, returns the flattened representation with string keys" do
      input = %{
        "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
        "year" => "1886",
        "country" => "GB",
        "publisher" => "Bickers & Son",
        "translated_book" => %{
          "authors" => "Isabel Burton",
          "original_book" => %{
            "authors" => "José de Alencar",
            "title" => "Iracema"
          }
        }
      }

      assert @output == PublicationCodec.flatten(input)
    end

    test "on a nested publication-like with atom keys, returns the flattened representation with string keys" do
      input = %{
        title: "Iraçéma the Honey-Lips: A Legend of Brazil",
        year: "1886",
        country: "GB",
        publisher: "Bickers & Son",
        translated_book: %{
          authors: "Isabel Burton",
          original_book: %{
            authors: "José de Alencar",
            title: "Iracema"
          }
        }
      }

      assert @output == PublicationCodec.flatten(input)
    end

    test "on a Publication struct, returns the flattened representation with string keys" do
      input = %Publication{
        title: "Iraçéma the Honey-Lips: A Legend of Brazil",
        year: "1886",
        country: "GB",
        publisher: "Bickers & Son",
        translated_book: %TranslatedBook{
          authors: "Isabel Burton",
          original_book: %OriginalBook{
            authors: "José de Alencar",
            title: "Iracema"
          }
        }
      }

      assert @output == PublicationCodec.flatten(input)
    end
  end
end