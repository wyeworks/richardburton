defmodule RichardBurton.Repo.Migrations.CreateOriginalBooks do
  use Ecto.Migration

  def change do
    create table(:original_books) do
      add(:authors, :string)
      add(:title, :string)

      timestamps()
    end
  end
end
