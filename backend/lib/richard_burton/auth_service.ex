defmodule RichardBurton.Auth do
  @moduledoc """
  Behaviour for authentication services
  """

  @callback get_config() :: Map.t()
  @callback get_keys() :: List.t()
  @callback verify(conn :: Plug.Conn.t(), params :: List.t()) :: :ok | :error

  defp impl, do: Application.get_env(:richard_burton, :auth_service, nil)

  @spec get_config() :: Map.t()
  def get_config, do: impl().get_config()

  @spec get_keys() :: List.t()
  def get_keys, do: impl().get_keys()

  @spec verify(conn :: Plug.Conn.t(), params :: List.t()) :: :ok | :error
  def verify(conn, keys), do: impl().verify(conn, keys)
end
