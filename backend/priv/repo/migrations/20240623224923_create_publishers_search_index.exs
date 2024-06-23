defmodule RichardBurton.Repo.Migrations.CreatePublishersSearchIndex do
  use Ecto.Migration

  def change do
    execute(
      "--Up
      CREATE INDEX publishers_name_trigram_index ON publishers USING gin(name gin_trgm_ops);
      ",
      "--Down
      DROP INDEX publishers_name_trigram_index;
      "
    )
  end
end
