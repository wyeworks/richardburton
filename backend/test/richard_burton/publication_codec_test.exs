defmodule RichardBurton.PublicationCodecTest do
  @moduledoc """
  Tests for the PublicationCodec module
  """

  use RichardBurton.DataCase

  alias RichardBurton.PublicationCodec

  describe "from_csv!/1 when the provided csv is valid" do
    test "when the provided csv file is valid, returns a list of publication-like maps" do
      assert [
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
             ] = PublicationCodec.from_csv!("test/fixtures/data_valid_mixed.csv")
    end
  end

  describe "from_csv!/1 when the provided csv is invalid" do
    test "because it has an incorrect format, raise an error" do
      assert_raise RuntimeError, fn ->
        PublicationCodec.from_csv!("test/fixtures/data_invalid_format.csv")
      end
    end

    test "because it has an invalid separator, raise an error" do
      assert_raise CSV.RowLengthError, fn ->
        PublicationCodec.from_csv!("test/fixtures/data_invalid_separator.csv")
      end
    end

    test "because it is incomplete, raise an error" do
      assert_raise CSV.RowLengthError, fn ->
        PublicationCodec.from_csv!("test/fixtures/data_invalid_incomplete.csv")
      end
    end
  end
end
