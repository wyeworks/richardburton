ExUnit.start()

Ecto.Adapters.SQL.Sandbox.mode(RichardBurton.Repo, :manual)

Mox.defmock(RichardBurton.AuthMock, for: RichardBurton.Auth)
Application.put_env(:richard_burton, :auth_service, RichardBurton.AuthMock)
