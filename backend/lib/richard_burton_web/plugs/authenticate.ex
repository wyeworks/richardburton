defmodule RichardBurtonWeb.Plugs.Authenticate do
  @moduledoc """
  Plug for authentication with Google
  """
  alias RichardBurton.Auth

  def init(params), do: params

  def call(conn, _params) do
    Auth.verify(conn)
    conn
  end
end
