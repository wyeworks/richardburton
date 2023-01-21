defmodule RichardBurtonWeb.Plugs.Authenticate do
  @moduledoc """
  Plug for authentication with Google
  """
  alias RichardBurton.Auth

  def init(params) do
    [Auth.get_config(), Auth.get_keys()] ++ params
  end

  def call(conn, params) do
    Auth.verify(conn, params)
    conn
  end
end
