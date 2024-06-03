defmodule RichardBurtonWeb.EmailController do
  use Phoenix.Controller
  require Logger
  alias RichardBurton.Email

  @spec contact(Plug.Conn.t(), any()) :: Plug.Conn.t()
  def contact(conn, params) do
    case Email.contact(params) do
      :ok ->
        json(conn, %{message: "Email sent."})

      {:error, {:invalid, issues}} ->
        conn |> put_status(400) |> json(%{issues: issues})

      {:error, reason} ->
        reason |> IO.inspect() |> Logger.error()
        conn |> put_status(500) |> json(%{message: "Could not send email."})
    end
  end
end
