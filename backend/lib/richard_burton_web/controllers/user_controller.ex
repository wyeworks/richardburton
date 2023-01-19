defmodule RichardBurtonWeb.UserController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.User

  def create(conn, attrs) do
    subject_id = attrs["subject_id"]

    case User.insert(attrs) do
      {:ok, user} -> conn |> put_status(:created) |> json(user)
      {:error, :conflict} -> conn |> put_status(:conflict) |> json(User.get(subject_id))
      {:error, _} -> conn |> put_status(:bad_request) |> json(nil)
    end
  end
end
