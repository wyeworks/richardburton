defmodule RichardBurton.User do
  @moduledoc """
  Schema for users
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.User
  alias RichardBurton.Repo
  alias RichardBurton.Validation

  schema "users" do
    field :subject_id, :string
    field :email, :string
    field :role, Ecto.Enum, values: [:reader, :contributor, :admin]

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:subject_id, :email])
    |> validate_required([:subject_id, :email])
    |> put_change(:role, :reader)
    |> unique_constraint([:subject_id])
  end

  def all do
    Repo.all(User)
  end

  def insert(attrs) do
    case %User{} |> changeset(attrs) |> Repo.insert() do
      {:ok, user} -> {:ok, user}
      {:error, changeset} -> {:error, Validation.get_errors(changeset)}
    end
  end
end
