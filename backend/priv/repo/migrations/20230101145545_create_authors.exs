defmodule RichardBurton.Repo.Migrations.CreateAuthors do
  use Ecto.Migration

  def change do
    # Author
    create table(:authors) do
      add :name, :string

      timestamps()
    end

    create unique_index(:authors, :name)

    # Join table with OriginalBook
    create table(:original_book_authors) do
      add :original_book_id, references(:original_books)
      add :author_id, references(:authors)
    end

    create unique_index(:original_book_authors, [:original_book_id, :author_id])

    # Join table with TranslatedBook
    create table(:translated_book_authors) do
      add :translated_book_id, references(:translated_books)
      add :author_id, references(:authors)
    end

    create unique_index(:translated_book_authors, [:translated_book_id, :author_id])

    # Drop unique indexes

    drop unique_index(:original_books, [
           :authors,
           :title
         ])

    drop unique_index(:translated_books, [
           :authors,
           :original_book_id
         ])

    # Data migration

    execute "-- Up

            INSERT INTO authors(
              name,
              inserted_at,
              updated_at)
            SELECT DISTINCT
              unnest(string_to_array(authors, ' and ')) AS name,
              now(),
              now()
            FROM (
              SELECT authors FROM original_books
              UNION
              SELECT authors FROM translated_books
            ) AS names;
            ",
            "-- Down
            "

    execute "-- Up

            INSERT INTO original_book_authors(
              original_book_id,
              author_id)
            SELECT
              original_books.id,
              authors.id
            FROM
              original_books,
              authors
            WHERE
              original_books.authors LIKE '%' || authors.name || '%'

            ",
            "-- Down

            UPDATE original_books
            SET authors = (
              SELECT
                string_agg(authors.name, ' and ')
              FROM
                original_book_authors,
                authors
              WHERE
                original_book_authors.author_id = authors.id
              AND
                original_book_authors.original_book_id = original_books.id
            );
            "

    execute "-- Up

            INSERT INTO translated_book_authors(
              translated_book_id,
              author_id)
            SELECT
              translated_books.id,
              authors.id
            FROM
              translated_books,
              authors
            WHERE
              translated_books.authors LIKE '%' || authors.name || '%'

            ",
            "-- Down

            UPDATE translated_books
            SET authors = (
              SELECT
                string_agg(authors.name, ' and ')
              FROM
                translated_book_authors,
                authors
              WHERE
                translated_book_authors.author_id = authors.id
              AND
                translated_book_authors.translated_book_id = translated_books.id
            );
            "

    # Remove legacy columns

    execute "--Up
            ALTER TABLE original_books DROP COLUMN authors;
            ",
            "--Down
            ALTER TABLE original_books ADD COLUMN authors CHARACTER VARYING;
            "

    execute "--Up
            ALTER TABLE translated_books DROP COLUMN authors;
            ",
            "--Down
            ALTER TABLE translated_books ADD COLUMN authors CHARACTER VARYING;
            "

    # Add authors_fingerprint columns

    execute "--Up
            ALTER TABLE original_books ADD COLUMN authors_fingerprint CHARACTER VARYING;
            ",
            "--Down
            ALTER TABLE original_books DROP COLUMN authors_fingerprint;
            "

    execute "--Up
            ALTER TABLE translated_books ADD COLUMN authors_fingerprint CHARACTER VARYING;
            ",
            "--Down
            ALTER TABLE translated_books DROP COLUMN authors_fingerprint;
            "

    # Calculate SHA-1 fingerprints based on authors

    execute "--Up
            UPDATE original_books
            SET authors_fingerprint = (
              SELECT
                encode(sha256(decode(string_agg(authors.name, ''), 'escape')), 'hex') AS fingerprint
              FROM
                original_book_authors,
                authors
              WHERE
                original_book_authors.author_id = authors.id
              AND
                original_book_authors.original_book_id = original_books.id
            )
            ",
            "--Down
            "

    execute "--Up
            UPDATE translated_books
            SET authors_fingerprint = (
              SELECT
                encode(sha256(decode(string_agg(authors.name, ''), 'escape')), 'hex') AS fingerprint
              FROM
                translated_book_authors,
                authors
              WHERE
                translated_book_authors.author_id = authors.id
              AND
                translated_book_authors.translated_book_id = translated_books.id
            )
            ",
            "--Down
            "

    # Recreate unique indexes

    create unique_index(:original_books, [
             :authors_fingerprint,
             :title
           ])

    create unique_index(:translated_books, [
             :authors_fingerprint,
             :original_book_id
           ])
  end
end
