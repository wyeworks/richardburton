defmodule RichardBurton.Mailer.SMTP do
  @moduledoc """
  STMP implementation for RichardBurton.Mailer behaviour
  """
  @behaviour RichardBurton.Mailer

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
end
