defmodule RichardBurton.Publication.CodecTest do
  @moduledoc """
  Tests for the Publication.Codec module
  """

  use RichardBurton.DataCase

  alias RichardBurton.Publication
  alias RichardBurton.TranslatedBook
  alias RichardBurton.OriginalBook

  describe "from_csv/1 when the provided csv is correct" do
    test "returns a list of flattened publications" do
      input = "test/fixtures/data_correct_with_errors.csv"

      output = [
        %{
          "authors" => "Isabel Burton, Richard Burton",
          "country" => "GB",
          "original_authors" => "José de Alencar",
          "original_title" => "Iracema",
          "publisher" => "Bickers & Son",
          "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
          "year" => "1886"
        },
        %{
          "authors" => "J. T. W. Sadler",
          "country" => "US",
          "original_authors" => "José de Alencar",
          "original_title" => "Ubirajara",
          "publisher" => "Ronald Massey",
          "title" => "Ubirajara: A Legend of the Tupy Indians",
          "year" => "1922"
        },
        %{
          "authors" => "",
          "country" => "GB",
          "original_authors" => "José de Alencar",
          "original_title" => "Iracema",
          "publisher" => "Bickers & Son",
          "title" => "",
          "year" => "AAAA"
        },
        %{
          "authors" => "J. T. W. Sadler",
          "country" => "",
          "original_authors" => "",
          "original_title" => "",
          "publisher" => "",
          "title" => "Ubirajara: A Legend of the Tupy Indians",
          "year" => ""
        }
      ]

      assert {:ok, output} == Publication.Codec.from_csv(input)
    end
  end

  describe "from_csv/1 when the provided csv is incorrect" do
    test "because it has malformed separators, does its best effort" do
      input = "test/fixtures/data_incorrect_malformed_separators.csv"

      output = [
        %{
          "authors" => "Isabel Burton",
          "country" => "GB",
          "original_authors" => "José de Alencar",
          "original_title" => "Iracema",
          "publisher" => "",
          "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
          "year" => "1886"
        },
        %{
          "authors" => "Ronald Massey",
          "country" => "Ubirajara",
          "original_authors" => "",
          "original_title" => "Ubirajara: A Legend of the Tupy Indians",
          "publisher" => "",
          "title" => "J. T. W. Sadler",
          "year" => "GB"
        },
        %{
          "authors" => "",
          "country" => "",
          "original_authors" =>
            "José de Alencar,1886,GB,Iracema,Iraçéma the Honey-Lips: A Legend of Brazil,Isabel Burton,Bickers & Son",
          "original_title" => "",
          "publisher" => "",
          "title" => "",
          "year" => ""
        }
      ]

      assert {:ok, output} == Publication.Codec.from_csv(input)
    end

    test "because it does not exist, return file_not_found error" do
      input = "test/fixtures/blablabla.csv"
      assert {:error, :file_not_found} == Publication.Codec.from_csv(input)
    end

    test "because it has a invalid escape sequence, return invalid_escape_sequence error" do
      input = "test/fixtures/data_incorrect_escape_sequence.csv"
      assert {:error, :invalid_escape_sequence} == Publication.Codec.from_csv(input)
    end
  end

  describe "flatten/1 on publications" do
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
          "authors" => [
            %{"name" => "Isabel Burton"}
          ],
          "original_book" => %{
            "authors" => [
              %{"name" => "José de Alencar"}
            ],
            "title" => "Iracema"
          }
        }
      }

      assert @output == Publication.Codec.flatten(input)
    end

    test "on a nested publication-like with atom keys, returns the flattened representation with string keys" do
      input = %{
        title: "Iraçéma the Honey-Lips: A Legend of Brazil",
        year: "1886",
        country: "GB",
        publisher: "Bickers & Son",
        translated_book: %{
          authors: [
            %{name: "Isabel Burton"}
          ],
          original_book: %{
            authors: [
              %{name: "José de Alencar"}
            ],
            title: "Iracema"
          }
        }
      }

      assert @output == Publication.Codec.flatten(input)
    end

    test "on a Publication struct, returns the flattened representation with string keys" do
      input = %Publication{
        title: "Iraçéma the Honey-Lips: A Legend of Brazil",
        year: "1886",
        country: "GB",
        publisher: "Bickers & Son",
        translated_book: %TranslatedBook{
          authors: [
            %{name: "Isabel Burton"}
          ],
          original_book: %OriginalBook{
            authors: [
              %{name: "José de Alencar"}
            ],
            title: "Iracema"
          }
        }
      }

      assert @output == Publication.Codec.flatten(input)
    end

    test "on a list, returns the flattened representation of its items, with string keys" do
      input = [
        %{
          "title" => "Iraçéma the Honey-Lips: A Legend of Brazil",
          "year" => "1886",
          "country" => "GB",
          "publisher" => "Bickers & Son",
          "translated_book" => %{
            "authors" => [
              %{"name" => "Isabel Burton"}
            ],
            "original_book" => %{
              "authors" => [
                %{"name" => "José de Alencar"}
              ],
              "title" => "Iracema"
            }
          }
        },
        %{
          title: "Iraçéma the Honey-Lips: A Legend of Brazil",
          year: "1886",
          country: "GB",
          publisher: "Bickers & Son",
          translated_book: %{
            authors: [
              %{name: "Isabel Burton"}
            ],
            original_book: %{
              authors: [
                %{name: "José de Alencar"}
              ],
              title: "Iracema"
            }
          }
        },
        %Publication{
          title: "Iraçéma the Honey-Lips: A Legend of Brazil",
          year: "1886",
          country: "GB",
          publisher: "Bickers & Son",
          translated_book: %TranslatedBook{
            authors: [
              %{name: "Isabel Burton"}
            ],
            original_book: %OriginalBook{
              authors: [
                %{name: "José de Alencar"}
              ],
              title: "Iracema"
            }
          }
        }
      ]

      assert [@output, @output, @output] == Publication.Codec.flatten(input)
    end
  end

  describe "flatten/1 on publication-error maps" do
    @output_publication %{
      "title" => "Ubirajara: A Legend of the Tupy Indians",
      "year" => "",
      "country" => "",
      "publisher" => "",
      "authors" => "J. T. W. Sadler",
      "original_authors" => "",
      "original_title" => ""
    }

    test "on a list, returns the flattened representation of its items, with string keys" do
      input_publication = %{
        "title" => "Ubirajara: A Legend of the Tupy Indians",
        "year" => "",
        "country" => "",
        "publisher" => "",
        "translated_book" => %{
          "authors" => [
            %{"name" => "J. T. W. Sadler"}
          ],
          "original_book" => %{
            "authors" => [
              %{"name" => ""}
            ],
            "title" => ""
          }
        }
      }

      input = [
        %{
          publication: input_publication,
          errors: %{
            year: "required",
            country: "required",
            publisher: "required",
            translated_book: %{
              original_book: %{
                authors: [%{name: "required"}],
                title: "required"
              }
            }
          }
        },
        %{
          publication: input_publication,
          errors: nil
        },
        %{
          publication: input_publication,
          errors: :conflict
        }
      ]

      output = [
        %{
          "publication" => @output_publication,
          "errors" => %{
            "year" => "required",
            "country" => "required",
            "publisher" => "required",
            "original_authors" => "required",
            "original_title" => "required"
          }
        },
        %{
          "publication" => @output_publication,
          "errors" => nil
        },
        %{
          "publication" => @output_publication,
          "errors" => :conflict
        }
      ]

      assert output == Publication.Codec.flatten(input)
    end
  end
end
