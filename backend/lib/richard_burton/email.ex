defmodule RichardBurton.Email do
  @moduledoc """
  Schema for emails
  """
  use Ecto.Schema
  import Ecto.Changeset
  import EctoCommons.EmailValidator

  alias RichardBurton.Email
  alias RichardBurton.Mailer

  schema "emails" do
    field :name, :string
    field :institution, :string
    field :address, :string
    field :subject, :string
    field :message, :string
  end

  def changeset(email, params) do
    email
    |> cast(params, [:name, :institution, :address, :subject, :message])
    |> validate_required([:name, :address, :subject, :message])
    |> validate_email(:address)
  end

  def contact(params) do
    case changeset = Email.changeset(%Email{}, params) do
      %Ecto.Changeset{valid?: true} ->
        changeset |> Ecto.Changeset.apply_changes() |> send

      %Ecto.Changeset{valid?: false} ->
        {:error, {:invalid, RichardBurton.Validation.get_errors(changeset)}}
    end
  end

  defp send(email) do
    case Mailer.send(email) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end
end
