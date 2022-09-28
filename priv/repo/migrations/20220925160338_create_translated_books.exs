defmodule RichardBurton.Repo.Migrations.CreateTranslatedBooks do
  use Ecto.Migration

  def change do
    create table(:translated_books) do
      add :original_title, :string
      add :original_authors, :string
      add :title, :string
      add :authors, :string
      add :year, :integer
      add :country, :string
      add :publisher, :string

      timestamps()
    end
  end
end
