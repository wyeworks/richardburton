defmodule RichardBurton.Auth.Unsecured do
  @moduledoc """
  Pass-through implementation for RichardBurton.Auth behaviour
  """
  @behaviour RichardBurton.Auth

  @impl true
  @spec init() :: {Map.t(), List.t()}
  def init, do: {%{}, []}

  @impl true
  @spec verify(token :: String.t()) :: {:ok, String.t()} | :error
  def verify(_token), do: {:ok, ""}

  @impl true
  @spec authorize(subject_id :: String.t(), role :: Atom.t()) :: :ok | :error
  def authorize(_subject_id, _role), do: :ok
end
