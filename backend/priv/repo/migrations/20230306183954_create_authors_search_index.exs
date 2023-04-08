defmodule RichardBurton.Repo.Migrations.CreateAuthorsSearchIndex do
  use Ecto.Migration

  def change do
    execute(
      "--Up
      CREATE INDEX authors_name_trigram_index ON authors USING gin(name gin_trgm_ops);
      ",
      "--Down
      DROP INDEX authors_name_trigram_index;
      "
    )
  end
end
