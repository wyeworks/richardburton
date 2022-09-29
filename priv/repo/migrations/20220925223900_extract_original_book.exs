defmodule RichardBurton.Repo.Migrations.ExtractOriginalBook do
  use Ecto.Migration

  def up do
    alter table(:translated_books) do
      add(:original_book_id, references(:original_books))
    end

    execute("""
    CREATE FUNCTION _insert_original_book(tb translated_books)
    RETURNS bigint
    LANGUAGE plpgsql
    AS $$
      DECLARE
        original_book_id bigint;  
      BEGIN
        SELECT
          id INTO original_book_id
        FROM
          original_books
        WHERE
          original_books.authors = tb.original_authors AND
          original_books.title = tb.original_title;

        IF original_book_id IS NULL THEN
          INSERT INTO original_books(
            title,
            authors,
            inserted_at,
            updated_at)
          SELECT
            original_title,
            original_authors,
            now(),
            now()
          FROM
            translated_books
          WHERE
            id = tb.id
          RETURNING id INTO original_book_id;
        END IF;

        RETURN original_book_id;
      END;
    $$;
    """)

    execute("""
    UPDATE 
      translated_books
    SET
      original_book_id = _insert_original_book(translated_books);
    """)

    execute("DROP FUNCTION _insert_original_book;")

    alter table(:translated_books) do
      remove(:original_title)
      remove(:original_authors)
    end
  end

  def down do
    alter table(:translated_books) do
      add(:original_title, :string)
      add(:original_authors, :string)
    end

    execute("""
    UPDATE translated_books
    SET
      original_title = original_books.title,
      original_authors = original_books.authors
    FROM original_books
    WHERE original_book_id = original_books.id
    """)

    alter table(:translated_books) do
      remove(:original_book_id)
    end

    execute("DELETE FROM original_books")
  end
end
