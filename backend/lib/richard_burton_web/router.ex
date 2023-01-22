defmodule RichardBurtonWeb.Router do
  use RichardBurtonWeb, :router

  pipeline :api do
    plug(:accepts, ["json"])
    plug(RichardBurtonWeb.Plugs.Authenticate)
  end

  pipeline :files do
    plug(:accepts, ["csv"])
  end

  scope "/api", RichardBurtonWeb do
    pipe_through(:api)

    scope "/publications" do
      get("/", PublicationController, :index)
      post("/bulk", PublicationController, :create_all)
      post("/validate", PublicationController, :validate)
    end

    post("/users", UserController, :create)
  end

  scope "/files", RichardBurtonWeb do
    pipe_through(:files)

    get("/publications", PublicationController, :export)
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through([:fetch_session, :protect_from_forgery])

      live_dashboard("/dashboard", metrics: RichardBurtonWeb.Telemetry)
    end
  end
end
