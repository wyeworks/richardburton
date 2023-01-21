defmodule RichardBurtonWeb.Plugs.Authenticate do
  @moduledoc """
  Plug for authentication with Google
  """
  alias RichardBurton.Auth

  import Plug.Conn

  def init(params), do: params

  def call(conn, _params) do
    case verify(conn) do
      :ok -> conn
      :error -> conn |> send_resp(:unauthorized, "Unauthorized") |> halt
    end
  end

  def verify(conn) do
    case Plug.Conn.get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> Auth.verify(token)
      _ -> :error
    end
  end
end
