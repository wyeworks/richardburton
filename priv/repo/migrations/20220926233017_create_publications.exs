defmodule RichardBurton.Repo.Migrations.CreatePublications do
  use Ecto.Migration

  def up do
    create table(:publications) do
      add(:title, :string)
      add(:year, :integer)
      add(:country, :string)
      add(:publisher, :string)
      add(:translated_book_id, references(:translated_books))
      timestamps()

      # Temporary fields for migration purposes
      add(:authors, :string)
      add(:original_book_id, references(:original_books))
    end

    create(unique_index(:publications, [:title, :year, :country, :publisher]))

    # Copy data from translated_books to publications
    execute("""
    INSERT INTO publications(
      title,
      year,
      country,
      publisher,
      authors,
      original_book_id,
      inserted_at,
      updated_at)
    SELECT 
      title,
      year,
      country,
      publisher,
      authors,
      original_book_id,
      inserted_at,
      updated_at 
    FROM
      translated_books
    """)

    # Delete duplicated translated_books, by authors and original_book_idq
    execute("""
    WITH temp AS (
      SELECT 
        id,
        authors,
        original_book_id,
        ROW_NUMBER() OVER(
          PARTITION BY 
            authors,
            original_book_id
          ORDER BY id) row_num
      FROM
        translated_books)
    DELETE FROM
      translated_books
    WHERE
      id IN (SELECT id FROM temp WHERE row_num > 1)
    """)

    # Use authors and original_book_id to link publications to translated_books
    execute("""
    UPDATE publications
    SET
      translated_book_id = translated_books.id
    FROM
      translated_books, original_books
    WHERE
      publications.authors = translated_books.authors AND 
      publications.original_book_id = translated_books.original_book_id
    """)

    drop(
      unique_index(:translated_books, [
        :authors,
        :title,
        :year,
        :country,
        :publisher
      ])
    )

    create(unique_index(:translated_books, [:authors, :original_book_id]))

    # Remove temporary fields
    alter table(:publications) do
      remove(:authors)
      remove(:original_book_id)
    end

    # Remove fields that now belong to publications
    alter table(:translated_books) do
      remove(:title)
      remove(:year)
      remove(:country)
      remove(:publisher)
    end
  end

  def down do
    drop(unique_index(:translated_books, [:authors, :original_book_id]))

    # Add temporary fields to publications for migration purposes
    alter table(:publications) do
      add(:authors, :string)
      add(:original_book_id, references(:original_books))
    end

    drop(constraint(:publications, :publications_translated_book_id_fkey))

    # Append translated_book data to existing publications
    execute("""
    UPDATE publications
    SET
      authors = translated_books.authors,
      original_book_id = translated_books.original_book_id
    FROM
      translated_books
    WHERE
      translated_books.id = translated_book_id
    """)

    # Truncate translated_books
    execute("""
    TRUNCATE TABLE translated_books
    """)

    # Add publications fields back to translated_books
    alter table(:translated_books) do
      add(:title, :string)
      add(:year, :integer)
      add(:country, :string)
      add(:publisher, :string)
    end

    create(
      unique_index(:translated_books, [
        :authors,
        :title,
        :year,
        :country,
        :publisher
      ])
    )

    # Copy publications data to translated_books
    execute("""
    INSERT INTO translated_books(
      title,
      year,
      country,
      publisher,
      authors,
      original_book_id,
      inserted_at,
      updated_at)
    SELECT
      title,
      year,
      country,
      publisher,
      authors,
      original_book_id,
      inserted_at,
      updated_at
    FROM
      publications
    """)

    # Drop publications table
    drop(table(:publications))
  end
end
