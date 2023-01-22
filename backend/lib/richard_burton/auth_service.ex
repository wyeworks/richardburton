defmodule RichardBurton.Auth do
  @moduledoc """
  Behaviour for authentication services
  """

  @module_not_found_message "Auth service implementation not found, did you specify :auth_service in your environment's config?"
  @config_not_found_message "Auth configuration not found, did you specify :auth_config in your environment's config?"

  @callback init() :: {Map.t(), List.t()}
  @callback verify(token :: String.t()) :: {:ok, String.t()} | :error
  @callback authorize(subject_id :: String.t(), role :: Atom.t()) :: :ok | :error

  @spec init() :: {Map.t(), List.t()}
  def init, do: impl().init()

  @spec verify(token :: String.t()) :: {:ok, String.t()} | :error
  def verify(token) do
    case Application.get_env(:richard_burton, :auth_config, nil) do
      nil -> throw(@config_not_found_message)
      _ -> impl().verify(token)
    end
  end

  @spec authorize(subject_id :: String.t(), role :: Atom.t()) :: :ok | :error
  def authorize(subject_id, role), do: impl().authorize(subject_id, role)

  defp impl do
    case Application.get_env(:richard_burton, :auth_service, nil) do
      nil -> throw(@module_not_found_message)
      module -> module
    end
  end
end
