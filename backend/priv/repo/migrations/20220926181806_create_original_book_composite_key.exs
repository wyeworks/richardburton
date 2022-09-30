defmodule RichardBurton.Repo.Migrations.CreateOriginalBookCompositeKey do
  use Ecto.Migration

  def change do
    create(unique_index(:original_books, [:authors, :title]))
  end
end
