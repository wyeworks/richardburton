defmodule RichardBurton.Auth.Google do
  @moduledoc """
  Google idp implementation for RichardBurton.Auth behaviour
  """
  @behaviour RichardBurton.Auth

  alias RichardBurton.User

  @impl true
  @spec init() :: {Map.t(), List.t()}
  def init(), do: {get_config(), get_keys()}

  @impl true
  @spec verify(token :: String.t()) :: {:ok, String.t()} | :error
  def verify(token) do
    case Application.get_env(:richard_burton, :auth_config) do
      {%{"issuer" => issuer}, keys} ->
        verify(
          token,
          issuer: issuer,
          audience: get_audience(),
          keys: keys
        )

      _ ->
        throw("Auth configuration is not properly set")
    end
  end

  @impl true
  @spec authorize(subject_id :: String.t(), role :: Atom.t()) :: :ok | :error
  def authorize(subject_id, role) do
    case User.get(subject_id) do
      %{role: ^role} -> :ok
      _ -> :error
    end
  end

  defp get_audience do
    case Application.get_env(:richard_burton, :google_client_id, nil) do
      nil -> throw("Google client id is not set")
      audience -> audience
    end
  end

  defp verify(token, issuer: issuer, audience: audience, keys: keys) do
    case Joken.verify(token, get_signer(token, keys)) do
      {:ok, %{"iss" => ^issuer, "aud" => ^audience, "sub" => subject_id}} -> {:ok, subject_id}
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
