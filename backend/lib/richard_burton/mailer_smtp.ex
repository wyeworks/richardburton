defmodule RichardBurton.Mailer.SMTP do
  @moduledoc """
  STMP implementation for RichardBurton.Mailer behaviour
  """
  @behaviour RichardBurton.Mailer

  import Swoosh.Email

  use Swoosh.Mailer,
    otp_app: :richard_burton,
    adapter: Swoosh.Adapters.SMTP,
    relay: Application.compile_env(:richard_burton, :smtp_host),
    username: Application.compile_env(:richard_burton, :smtp_user),
    password: Application.compile_env(:richard_burton, :smtp_pass),
    port: Application.compile_env(:richard_burton, :smtp_port),
    tls: Application.compile_env(:richard_burton, :smtp_tls),
    retries: 1,
    no_mx_lookups: false

  @spec send(RichardBurton.Email.t()) :: {:ok, any()} | {:error, any()}
  def send(email) do
    case deliver(get_swoosh_email(email)) do
      {:ok, payload} -> {:ok, payload}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec get_swoosh_email(RichardBurton.Email.t()) :: Swoosh.Email.t()
  defp get_swoosh_email(email = %{address: address, subject: subject, message: message, to: nil}) do
    new(
      from: {get_contact_name(email), address},
      to: Application.get_env(:richard_burton, :smtp_from),
      subject: subject,
      text_body: message
    )
  end

  @spec get_swoosh_email(RichardBurton.Email.t()) :: Swoosh.Email.t()
  defp get_swoosh_email(email = %{address: address, subject: subject, message: message, to: to}) do
    new(
      from: {get_contact_name(email), address},
      to: to,
      subject: subject,
      text_body: message
    )
  end

  defp get_contact_name(%{name: name, institution: nil}), do: name
  defp get_contact_name(%{name: name, institution: ""}), do: name
  defp get_contact_name(%{name: name, institution: institution}), do: "#{name} (#{institution})"
  defp get_contact_name(%{name: name}), do: name
end
