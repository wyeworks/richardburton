defmodule RichardBurton.Country do
  @moduledoc """
  Utilities for standardized country manipulation
  """
  import Ecto.Changeset

  def validate_country(changeset) do
    validate_change(changeset, :country, fn :country, country ->
      if Countries.exists?(:alpha2, country) do
        []
      else
        [country: {"Invalid ISO-3361-1 alpha2 country code", [validation: :alpha2]}]
      end
    end)
  end
end
