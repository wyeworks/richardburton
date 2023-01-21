defmodule RichardBurton.Auth do
  @moduledoc """
  Behaviour for authentication services
  """

  @callback init() :: {Map.t(), List.t()}
  @callback verify(conn :: Plug.Conn.t()) :: :ok | :error

  @spec init() :: {Map.t(), List.t()}
  def init, do: impl().init()

  @spec verify(conn :: Plug.Conn.t()) :: :ok | :error
  def verify(conn), do: impl().verify(conn)

  defp impl, do: Application.get_env(:richard_burton, :auth_service, nil)
end
