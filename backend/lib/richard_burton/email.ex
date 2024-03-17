defmodule RichardBurton.Email do
  @moduledoc """
  Schema for emails
  """
  use Ecto.Schema
  import Ecto.Changeset
  import EctoCommons.EmailValidator
  import Swoosh.Email

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
        changeset |> Ecto.Changeset.apply_changes() |> deliver

      %Ecto.Changeset{valid?: false} ->
        {:error, {:invalid, RichardBurton.Validation.get_errors(changeset)}}
    end
  end

  defp deliver(email = %{address: address, subject: subject, message: message}) do
    case Mailer.deliver(
           new(
             from: {get_contact_name(email), address},
             to: Application.get_env(:richard_burton, :smtp_from),
             subject: subject,
             text_body: message
           )
         ) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  defp get_contact_name(%{name: name, institution: nil}), do: name
  defp get_contact_name(%{name: name, institution: ""}), do: name
  defp get_contact_name(%{name: name, institution: institution}), do: "#{name} (#{institution})"
end
