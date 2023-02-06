defmodule RichardBurton.Repo.Migrations.AddTranslatedBookFingerprintToPublication do
  use Ecto.Migration

  def change do
    alter table("publications") do
      add(:translated_book_fingerprint, :string)
    end

    execute(
      "--Up
      UPDATE publications
      SET translated_book_fingerprint = (
        SELECT
          encode(sha256(decode(concat(translated_books.original_book_fingerprint, translated_books.authors_fingerprint), 'escape')), 'hex') AS fingerprint
        FROM
          translated_books
        WHERE
          publications.translated_book_id = translated_books.id
      )
      ",
      "--Down
      "
    )

    execute(
      "--Up
      ALTER TABLE publications ALTER COLUMN translated_book_fingerprint SET NOT NULL;
      ",
      "--Down
      ALTER TABLE publications ALTER COLUMN translated_book_fingerprint DROP NOT NULL;
      "
    )

    drop(
      unique_index(:publications, [
        :title,
        :year,
        :country,
        :publisher
      ])
    )

    create(
      unique_index(
        :publications,
        [
          :title,
          :year,
          :country,
          :publisher,
          :translated_book_fingerprint
        ],
        name: "publications_composite_key"
      )
    )
  end
end
