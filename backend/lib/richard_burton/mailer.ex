defmodule RichardBurton.Mailer do
  @moduledoc """
  Behaviour for Mailer
  """

  @callback deliver(email :: Swoosh.Email.t()) :: {:ok, String.t()} | {:error, String.t()}

  @spec deliver(email :: Swoosh.Email.t()) :: {:ok, String.t()} | {:error, String.t()}
  def deliver(email), do: impl().deliver(email)

  defp impl,
    do: Application.get_env(:richard_burton, :mailer, RichardBurton.Mailer.SMTP)
end
