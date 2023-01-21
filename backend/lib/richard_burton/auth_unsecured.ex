defmodule RichardBurton.Auth.Unsecured do
  @moduledoc """
  Pass-through implementation for RichardBurton.Auth behaviour
  """
  @behaviour RichardBurton.Auth

  @impl true
  @spec get_config() :: Map.t()
  def get_config, do: %{}

  @impl true
  @spec get_keys() :: List.t()
  def get_keys, do: []

  @impl true
  @spec verify(conn :: Plug.Conn.t(), params :: List.t()) :: :ok | :error
  def verify(_conn, _params), do: :ok
end
