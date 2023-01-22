defmodule RichardBurtonWeb.UserController do
  use RichardBurtonWeb, :controller

  alias RichardBurton.User

  def create(conn = %{assigns: %{subject_id: subject_id}}, attrs) do
    case User.insert(Map.put(attrs, "subject_id", subject_id)) do
      {:ok, user} -> conn |> put_status(:created) |> json(user)
      {:error, :conflict} -> conn |> put_status(:conflict) |> json(User.get(subject_id))
      {:error, _} -> conn |> put_status(:bad_request) |> json(nil)
    end
  end

  def create(conn) do
    conn |> put_status(:unauthorized) |> json("Unauthorized")
  end
end
