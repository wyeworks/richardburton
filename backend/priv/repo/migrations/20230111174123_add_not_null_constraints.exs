defmodule RichardBurton.Repo.Migrations.AddNotNullConstraints do
  use Ecto.Migration

  def change do
    # Set constraints

    execute "--Up
            ALTER TABLE authors ALTER COLUMN name SET NOT NULL;
            ",
            "--Down
            ALTER TABLE authors ALTER COLUMN name DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE original_books ALTER COLUMN title SET NOT NULL;
            ",
            "--Down
            ALTER TABLE original_books ALTER COLUMN title DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE original_books ALTER COLUMN authors_fingerprint SET NOT NULL;
            ",
            "--Down
            ALTER TABLE original_books ALTER COLUMN authors_fingerprint DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE translated_books ALTER COLUMN authors_fingerprint SET NOT NULL;
            ",
            "--Down
            ALTER TABLE translated_books ALTER COLUMN authors_fingerprint DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE translated_books ALTER COLUMN original_book_id SET NOT NULL;
            ",
            "--Down
            ALTER TABLE translated_books ALTER COLUMN original_book_id DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE publications ALTER COLUMN title SET NOT NULL;
            ",
            "--Down
            ALTER TABLE publications ALTER COLUMN title DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE publications ALTER COLUMN year SET NOT NULL;
            ",
            "--Down
            ALTER TABLE publications ALTER COLUMN year DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE publications ALTER COLUMN country SET NOT NULL;
            ",
            "--Down
            ALTER TABLE publications ALTER COLUMN country DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE publications ALTER COLUMN publisher SET NOT NULL;
            ",
            "--Down
            ALTER TABLE publications ALTER COLUMN publisher DROP NOT NULL;
            "

    execute "--Up
            ALTER TABLE publications ALTER COLUMN translated_book_id SET NOT NULL;
            ",
            "--Down
            ALTER TABLE publications ALTER COLUMN translated_book_id DROP NOT NULL;
            "
  end
end
