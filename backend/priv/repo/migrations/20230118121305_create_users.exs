defmodule RichardBurton.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add(:subject_id, :string, null: false)
      add(:email, :string, null: false)
      add(:role, :string, null: false, default: "reader")

      timestamps()
    end

    create unique_index(:users, [:subject_id])
  end
end
