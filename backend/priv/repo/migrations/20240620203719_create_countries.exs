defmodule RichardBurton.Repo.Migrations.CreateCountries do
  use Ecto.Migration

  def change do
    create table(:countries) do
      add :code, :string
      timestamps()
    end

    create unique_index(:countries, :code)

    execute "-- Up

              INSERT INTO countries(
                code,
                inserted_at,
                updated_at
              )
              SELECT DISTINCT
                btrim(unnest(string_to_array(country, ','))) AS country,
                now(),
                now()
              FROM
                publications;
              ",
            "-- Down

              DELETE FROM countries;
              "

    create table(:publication_countries) do
      add :publication_id, references(:publications)
      add :country_id, references(:countries)
    end

    create unique_index(:publication_countries, [:publication_id, :country_id])

    execute "-- Up

              INSERT INTO publication_countries (
                publication_id,
                country_id
              )
              SELECT
                publications.id AS publication_id,
                countries.id AS country_id
              FROM
                publications
              INNER JOIN
                countries
              ON
                countries.code = ANY(
                  SELECT
                    btrim(unnest(string_to_array(publications.country, ',')))
                  FROM
                    publications AS aux
                  WHERE
                    publications.id = aux.id
                );

              ",
            "-- Down

              DELETE FROM publication_countries;
              "

    alter table("publications") do
      add :countries_fingerprint, :string
    end

    execute(
      "--Up
      UPDATE publications
      SET countries_fingerprint = (
        SELECT
          encode(sha256(decode(string_agg(countries.code, '' ORDER BY countries.code), 'escape')), 'hex') AS fingerprint
        FROM
          publication_countries
        INNER JOIN
          countries ON publication_countries.country_id = countries.id
        WHERE
          publication_countries.publication_id = publications.id
        GROUP BY
          publication_countries.publication_id
      )
      ",
      "--Down
      "
    )

    drop(
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

    execute "-- Up
            ALTER TABLE publications
            ALTER COLUMN countries_fingerprint SET NOT NULL;
            ",
            "-- Down

            ALTER TABLE publications
            ALTER COLUMN countries_fingerprint DROP NOT NULL;
            "

    create unique_index(
             :publications,
             [
               :title,
               :year,
               :publisher,
               :translated_book_fingerprint,
               :countries_fingerprint
             ],
             name: "publications_composite_key"
           )

    execute "--Up

            DROP MATERIALIZED VIEW search_documents;
            ",
            "--Down

            CREATE MATERIALIZED VIEW search_documents AS
            SELECT
              id,
              to_tsvector('simple'::regconfig, title)                ||
              to_tsvector('simple'::regconfig, country)              ||
              to_tsvector('simple'::regconfig, publisher)            ||
              to_tsvector('simple'::regconfig, year::text)           ||
              to_tsvector('simple'::regconfig, authors)              ||
              to_tsvector('simple'::regconfig, original_title)       ||
              to_tsvector('simple'::regconfig, original_authors)     AS document
            FROM
              flat_publications;
            "

    execute "--Up

            DROP VIEW flat_publications
            ",
            "--Down
            "

    execute "--Up

            CREATE OR REPLACE VIEW flat_publications AS
            WITH
            CTE_publications AS (
              SELECT
                  publications.id AS id,
                  publications.title AS title,
                  publications.year AS year,
                  publications.publisher AS publisher,
                  authors.name AS original_author,
                  translators.name AS translator,
                  original_books.title AS original_title,
                  publications.translated_book_fingerprint AS translated_book_fingerprint,
                  publications.countries_fingerprint AS countries_fingerprint,
                  countries.code AS country
              FROM
                  translated_books
              INNER JOIN
                  publications
                  ON publications.translated_book_id = translated_books.id
              INNER JOIN
                  original_books
                  ON original_books.id = translated_books.original_book_id
              INNER JOIN
                  original_book_authors
                  ON original_book_authors.original_book_id = original_books.id
              INNER JOIN
                  authors
                  ON authors.id = original_book_authors.author_id
              INNER JOIN
                  translated_book_authors
                  ON translated_book_authors.translated_book_id = translated_books.id
              INNER JOIN
                  authors AS translators
                  ON translators.id = translated_book_authors.author_id
              INNER JOIN
                  publication_countries
                  ON publication_countries.publication_id = publications.id
              INNER JOIN
                  countries
                  ON countries.id = publication_countries.country_id
            ),
            CTE_authors AS (
              SELECT id, original_author
              FROM CTE_publications
              GROUP BY id, original_author
            ),
            CTE_authors_distinct AS (
              SELECT id, string_agg(original_author, ', ' ORDER BY original_author) AS original_authors
              FROM CTE_authors
              GROUP BY id
            ),
            CTE_translators AS (
              SELECT id, translator
              FROM CTE_publications
              GROUP BY id, translator
            ),
            CTE_translators_distinct AS (
              SELECT id, string_agg(translator, ', ' ORDER BY translator) AS translators
              FROM CTE_translators
              GROUP BY id
            ),
            CTE_countries AS (
              SELECT id, country
              FROM CTE_publications
              GROUP BY id, country
            ),
            CTE_countries_distinct AS (
              SELECT id, string_agg(country, ', ' ORDER BY country) AS countries
              FROM CTE_countries
              GROUP BY id
            )
            SELECT
              CTE_publications.id AS id,
              CTE_publications.title AS title,
              CTE_countries_distinct.countries AS countries,
              CTE_publications.countries_fingerprint AS countries_fingerprint,
              CTE_publications.year AS year,
              CTE_publications.publisher AS publisher,
              CTE_publications.original_title AS original_title,
              CTE_authors_distinct.original_authors AS original_authors,
              CTE_translators_distinct.translators AS authors,
              CTE_publications.translated_book_fingerprint AS translated_book_fingerprint
            FROM
              CTE_publications
            INNER JOIN
              CTE_authors_distinct
              ON CTE_publications.id = CTE_authors_distinct.id
            INNER JOIN
              CTE_translators_distinct
              ON CTE_publications.id = CTE_translators_distinct.id
            INNER JOIN
              CTE_countries_distinct
              ON CTE_publications.id = CTE_countries_distinct.id
            GROUP BY
              CTE_publications.id,
              CTE_publications.title,
              CTE_countries_distinct.countries,
              CTE_publications.year,
              CTE_publications.publisher,
              CTE_publications.original_title,
              CTE_authors_distinct.original_authors,
              CTE_translators_distinct.translators,
              CTE_publications.translated_book_fingerprint,
              CTE_publications.countries_fingerprint;
            ",
            "-- Down

            CREATE OR REPLACE VIEW flat_publications AS
            WITH
            CTE_publications AS (
              SELECT
                  publications.id AS id,
                  publications.title AS title,
                  publications.country AS country,
                  publications.year AS year,
                  publications.publisher AS publisher,
                  authors.name AS original_author,
                  translators.name AS translator,
                  original_books.title AS original_title,
                  publications.translated_book_fingerprint AS translated_book_fingerprint
              FROM
                  translated_books
              INNER JOIN
                  publications
                  ON publications.translated_book_id = translated_books.id
              INNER JOIN
                  original_books
                  ON original_books.id = translated_books.original_book_id
              INNER JOIN
                  original_book_authors
                  ON original_book_authors.original_book_id = original_books.id
              INNER JOIN
                  authors
                  ON authors.id = original_book_authors.author_id
              INNER JOIN
                  translated_book_authors
                  ON translated_book_authors.translated_book_id = translated_books.id
              INNER JOIN
                  authors AS translators
                  ON translators.id = translated_book_authors.author_id
            ),
            CTE_authors AS (
              SELECT id, original_author
              FROM CTE_publications
              GROUP BY id, original_author
            ),
            CTE_authors_distinct AS (
              SELECT id, string_agg(original_author, ', ' ORDER BY original_author) AS original_authors
              FROM CTE_authors
              GROUP BY id
            ),
            CTE_translators AS (
              SELECT id, translator
              FROM CTE_publications
              GROUP BY id, translator
            ),
            CTE_translators_distinct AS (
              SELECT id, string_agg(translator, ', ' ORDER BY translator) AS translators
              FROM CTE_translators
              GROUP BY id
            )
            SELECT
              CTE_publications.id AS id,
              CTE_publications.title AS title,
              CTE_publications.country AS country,
              CTE_publications.year AS year,
              CTE_publications.publisher AS publisher,
              CTE_publications.original_title AS original_title,
              CTE_authors_distinct.original_authors AS original_authors,
              CTE_translators_distinct.translators AS authors,
              CTE_publications.translated_book_fingerprint AS translated_book_fingerprint
            FROM
              CTE_publications
            INNER JOIN
              CTE_authors_distinct
              ON CTE_publications.id = CTE_authors_distinct.id
            INNER JOIN
              CTE_translators_distinct
              ON CTE_publications.id = CTE_translators_distinct.id
            GROUP BY
              CTE_publications.id,
              CTE_publications.title,
              CTE_publications.country,
              CTE_publications.year,
              CTE_publications.publisher,
              CTE_publications.original_title,
              CTE_authors_distinct.original_authors,
              CTE_translators_distinct.translators,
              CTE_publications.translated_book_fingerprint;
            "

    execute "--Up
            ",
            "--Down

            DROP VIEW flat_publications
            "

    execute "--Up

            CREATE MATERIALIZED VIEW search_documents AS
            SELECT
              id,
              to_tsvector('simple'::regconfig, title)                ||
              to_tsvector('simple'::regconfig, countries)            ||
              to_tsvector('simple'::regconfig, publisher)            ||
              to_tsvector('simple'::regconfig, year::text)           ||
              to_tsvector('simple'::regconfig, authors)              ||
              to_tsvector('simple'::regconfig, original_title)       ||
              to_tsvector('simple'::regconfig, original_authors)     AS document
            FROM
              flat_publications;

            ",
            "--Down

            DROP MATERIALIZED VIEW search_documents;
            "

    execute "-- Up
            ",
            "-- Down

            ALTER TABLE publications
            ALTER COLUMN country SET NOT NULL;
            "

    execute "-- Up
            ",
            "-- Down

            UPDATE publications
            SET country = (
              SELECT
                string_agg(countries.code, ', ' ORDER BY countries.code)
              FROM
                countries
              INNER JOIN
                publication_countries
              ON
                countries.id = publication_countries.country_id
              WHERE
                publication_countries.publication_id = publications.id
              GROUP BY
                publication_countries.publication_id
            );
            "

    execute "-- Up

            ALTER TABLE publications
            DROP COLUMN country;
            ",
            "-- Down

            ALTER TABLE publications
            ADD country VARCHAR;
            "
  end
end
