defmodule RichardBurton.Repo.Migrations.AddOriginalBookFingerprintToTranslatedBook do
  use Ecto.Migration

  def change do
    alter table("translated_books") do
      add(:original_book_fingerprint, :string)
    end

    execute(
      "--Up
      UPDATE translated_books
      SET original_book_fingerprint = (
        SELECT
          encode(sha256(decode(concat(original_books.title, original_books.authors_fingerprint), 'escape')), 'hex') AS fingerprint
        FROM
          original_books
        WHERE
          translated_books.original_book_id = original_books.id
      )
      ",
      "--Down
      "
    )

    execute(
      "--Up
      ALTER TABLE translated_books ALTER COLUMN original_book_fingerprint SET NOT NULL;
      ",
      "--Down
      ALTER TABLE translated_books ALTER COLUMN original_book_fingerprint DROP NOT NULL;
      "
    )

    drop(unique_index(:translated_books, [:authors_fingerprint, :original_book_id]))

    create(unique_index(:translated_books, [:authors_fingerprint, :original_book_fingerprint]),
      name: "translated_books_composite_key"
    )
  end
end
