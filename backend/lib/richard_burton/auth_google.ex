defmodule RichardBurton.Auth.Google do
  @moduledoc """
  Google idp implementation for RichardBurton.Auth behaviour
  """
  @behaviour RichardBurton.Auth

  @impl true
  @spec init() :: {Map.t(), List.t()}
  def init(), do: {get_config(), get_keys()}

  @impl true
  @spec verify(conn :: Plug.Conn.t()) :: :ok | :error
  def verify(conn) do
    {%{"issuer" => issuer}, keys} = init()

    audience = Application.get_env(:richard_burton, :google_client_id)

    case Joken.verify(get_token(conn), get_signer(conn, keys)) do
      {:ok, %{"iss" => ^issuer, "aud" => ^audience}} -> :ok
      _ -> :error
    end
  end

  defp get_signer(conn, keys) do
    {:ok, %{"kid" => kid}} = Joken.peek_header(get_token(conn))
    %{"alg" => alg} = key = Enum.find(keys, fn k -> k["kid"] == kid end)
    Joken.Signer.create(alg, key)
  end

  defp get_token(conn) do
    ["Bearer " <> token] = Plug.Conn.get_req_header(conn, "authorization")
    token
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
