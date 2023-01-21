defmodule RichardBurton.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      RichardBurton.Repo,
      # Start the Telemetry supervisor
      RichardBurtonWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: RichardBurton.PubSub},
      # Start the Endpoint (http/https)
      RichardBurtonWeb.Endpoint
      # Start a worker by calling: RichardBurton.Worker.start_link(arg)
      # {RichardBurton.Worker, arg}
    ]

    Application.put_env(:richard_burton, :auth_config, RichardBurton.Auth.init())

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: RichardBurton.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    RichardBurtonWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
