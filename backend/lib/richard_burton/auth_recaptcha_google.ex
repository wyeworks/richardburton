defmodule RichardBurton.Auth.Recaptcha.Google do
  @spec verify(binary()) :: none()
  def verify(token) do
    verification_url = Application.get_env(:richard_burton, :google_recaptcha_verification_url)
    verification_secret = Application.get_env(:richard_burton, :google_recaptcha_secret_key)

    request_body = "secret=#{verification_secret}&response=#{token}"

    request_headers = [
      {"Content-Type", "application/x-www-form-urlencoded"},
      {"Content-Length", Integer.to_string(byte_size(request_body))}
    ]

    case HTTPoison.post(verification_url, request_body, request_headers) do
      {:ok, %{body: response_body}} ->
        case Jason.decode(response_body) do
          {:ok, %{"success" => true}} -> :ok
          {:ok, %{"success" => false, "error-codes" => issues}} -> {:error, issues}
          {:error, _reason} -> {:error, "Failed to decode JSON response"}
        end

      {:error, _reason} ->
        {:error, "Failed to make verification request"}
    end
  end
end
