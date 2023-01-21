defmodule RichardBurton.Auth.Unsecured do
  @moduledoc """
  Pass-through implementation for RichardBurton.Auth behaviour
  """
  @behaviour RichardBurton.Auth

  @impl true
  @spec init() :: {Map.t(), List.t()}
  def init, do: {%{}, []}

  @impl true
  @spec verify(token :: String.t()) :: :ok | :error
  def verify(_token), do: :ok
end
