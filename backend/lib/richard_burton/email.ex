defmodule RichardBurton.Email do
  @moduledoc """
  Schema for emails
  """
  use Ecto.Schema
  import Ecto.Changeset
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
    |> validate_required([:name, :institution, :address, :subject, :message])
  end

  def contact(params) do
    case changes = Email.changeset(%Email{}, params) do
      %Ecto.Changeset{valid?: true} ->
        %{
          name: name,
          institution: institution,
          address: address,
          subject: subject,
          message: message
        } = Ecto.Changeset.apply_changes(changes)

        case Mailer.deliver(
               new(
                 from: {"#{name} (#{institution})", address},
                 to: Application.get_env(:richard_burton, :smtp_from),
                 subject: subject,
                 text_body: message
               )
             ) do
          {:ok, _} -> :ok
          {:error, reason} -> {:error, reason}
        end

      %Ecto.Changeset{valid?: false} ->
        {:error, {:invalid, changes.errors}}
    end
  end
end
