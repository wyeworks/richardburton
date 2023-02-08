defmodule RichardBurton.Repo.Migrations.RecalculateAuthorsFingerprintSortingNames do
  use Ecto.Migration

  def up do
    execute("
      UPDATE original_books
      SET authors_fingerprint = (
        SELECT
          encode(sha256(decode(string_agg(authors.name, '' ORDER BY authors.name), 'escape')), 'hex') AS fingerprint
        FROM
          original_book_authors,
          authors
        WHERE
          original_book_authors.author_id = authors.id
        AND
          original_book_authors.original_book_id = original_books.id
        GROUP BY
          authors.name
        ORDER BY
          authors.name
      )
      ")

    execute("
      UPDATE translated_books
      SET authors_fingerprint = (
        SELECT
          encode(sha256(decode(string_agg(authors.name, '' ORDER BY authors.name), 'escape')), 'hex') AS fingerprint
        FROM
          translated_book_authors,
          authors
        WHERE
          translated_book_authors.author_id = authors.id
        AND
          translated_book_authors.translated_book_id = translated_books.id
        GROUP BY
          authors.name
        ORDER BY
          authors.name
      )
      ")
  end

  def down do
    execute("
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
      ")

    execute("
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
      ")
  end
end
