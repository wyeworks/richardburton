defmodule RichardBurton.Repo.Migrations.CreateOriginalBookSearchIndex do
  use Ecto.Migration

  def change do
    execute(
      "--Up
      CREATE INDEX original_books_title_trigram_index ON original_books USING gin(title gin_trgm_ops);
      ",
      "--Down
      DROP INDEX original_books_title_trigram_index;
      "
    )
  end
end
