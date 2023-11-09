# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :richard_burton,
  ecto_repos: [RichardBurton.Repo]

# Postgrex configuration
config :richard_burton, RichardBurton.Repo,
  timeout: String.to_integer(System.get_env("POSTGREX_TIMEOUT", "15000"))

# Configures the endpoint

config :richard_burton, RichardBurtonWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    view: RichardBurtonWeb.ErrorView,
    accepts: ~w(json),
    layout: false
  ],
  pubsub_server: RichardBurton.PubSub,
  live_view: [signing_salt: "L5BIKL+B"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"

# Sentry configuration
sentry_dsn = System.get_env("SENTRY_DSN")
sentry_environment = System.get_env("SENTRY_ENVIRONMENT", "development")

if sentry_dsn && sentry_environment && Mix.env() !== :test do
  config :sentry,
    dsn: sentry_dsn,
    environment_name: sentry_environment,
    enable_source_code_context: true,
    root_source_code_path: File.cwd!(),
    tags: %{env: "production"},
    included_environments: [:production, :staging]
end
