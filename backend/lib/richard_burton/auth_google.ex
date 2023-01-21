defmodule RichardBurton.Auth.Google do
  @moduledoc """
  Google idp implementation for RichardBurton.Auth behaviour
  """
  @behaviour RichardBurton.Auth

  @impl true
  @spec init() :: {Map.t(), List.t()}
  def init(), do: {get_config(), get_keys()}

  @impl true
  @spec verify(token :: String.t()) :: :ok | :error
  def verify(token) do
    {%{"issuer" => issuer}, keys} = Application.get_env(:richard_burton, :auth_config)
    audience = Application.get_env(:richard_burton, :google_client_id)

    case Joken.verify(token, get_signer(token, keys)) do
      {:ok, %{"iss" => ^issuer, "aud" => ^audience}} -> :ok
      _ -> :error
    end
  end

  defp get_signer(token, keys) do
    {:ok, %{"kid" => kid}} = Joken.peek_header(token)
    %{"alg" => alg} = key = Enum.find(keys, fn k -> k["kid"] == kid end)
    Joken.Signer.create(alg, key)
  end

  defp get_config do
    Application.get_env(:richard_burton, :google_openid_config_url)
    |> HTTPoison.get!()
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.take(["issuer"])
  end

  defp get_keys do
    Application.get_env(:richard_burton, :google_oauth2_certs_url)
    |> HTTPoison.get!()
    |> Map.get(:body)
    |> Jason.decode!()
    |> Map.get("keys")
  end
end
