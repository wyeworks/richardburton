defmodule RichardBurton.Auth.Unsecured do
  @moduledoc """
  Pass-through implementation for RichardBurton.Auth behaviour
  """
  @behaviour RichardBurton.Auth

  @impl true
  @spec init() :: {Map.t(), List.t()}
  def init, do: {%{}, []}

  @impl true
  @spec verify(conn :: Plug.Conn.t()) :: :ok | :error
  def verify(_conn), do: :ok
end
