defmodule RichardBurton.Repo.Migrations.CreatePublishers do
  use Ecto.Migration

  def change do
    create table(:publishers) do
      add :name, :string
      timestamps()
    end

    create unique_index(:publishers, :name)

    execute "-- Up

              INSERT INTO publishers(
                name,
                inserted_at,
                updated_at
              )
              SELECT DISTINCT
                btrim(unnest(string_to_array(publisher, ','))) AS publisher,
                now(),
                now()
              FROM
                publications;
              ",
            "-- Down

              DELETE FROM publishers;
              "

    create table(:publication_publishers) do
      add :publication_id, references(:publications)
      add :publisher_id, references(:publishers)
    end

    create unique_index(:publication_publishers, [:publication_id, :publisher_id])

    execute "-- Up

              INSERT INTO publication_publishers (
                publication_id,
                publisher_id
              )
              SELECT
                publications.id AS publication_id,
                publishers.id AS publisher_id
              FROM
                publications
              INNER JOIN
                publishers
              ON
                publishers.name = ANY(
                  SELECT
                    btrim(unnest(string_to_array(publications.publisher, ',')))
                  FROM
                    publications AS aux
                  WHERE
                    publications.id = aux.id
                );

              ",
            "-- Down

              DELETE FROM publication_publishers;
              "

    alter table("publications") do
      add :publishers_fingerprint, :string
    end

    execute(
      "--Up
      UPDATE publications
      SET publishers_fingerprint = (
        SELECT
          encode(sha256(decode(string_agg(publishers.name, '' ORDER BY publishers.name), 'escape')), 'hex') AS fingerprint
        FROM
          publication_publishers
        INNER JOIN
          publishers ON publication_publishers.publisher_id = publishers.id
        WHERE
          publication_publishers.publication_id = publications.id
        GROUP BY
          publication_publishers.publication_id
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
          :publisher,
          :translated_book_fingerprint,
          :countries_fingerprint
        ],
        name: "publications_composite_key"
      )
    )

    execute "-- Up
            ALTER TABLE publications
            ALTER COLUMN publishers_fingerprint SET NOT NULL;
            ",
            "-- Down

            ALTER TABLE publications
            ALTER COLUMN publishers_fingerprint DROP NOT NULL;
            "

    create unique_index(
             :publications,
             [
               :title,
               :year,
               :publishers_fingerprint,
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
              to_tsvector('simple'::regconfig, countries)            ||
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
                  authors.name AS original_author,
                  translators.name AS translator,
                  original_books.title AS original_title,
                  publications.translated_book_fingerprint AS translated_book_fingerprint,
                  publications.countries_fingerprint AS countries_fingerprint,
                  publications.publishers_fingerprint AS publishers_fingerprint,
                  countries.code AS country,
                  publishers.name AS publisher
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
              INNER JOIN
                  publication_publishers
                  ON publication_publishers.publication_id = publications.id
              INNER JOIN
                  publishers
                  ON publishers.id = publication_publishers.publisher_id
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
            ),
            CTE_publishers AS (
              SELECT id, publisher
              FROM CTE_publications
              GROUP BY id, publisher
            ),
            CTE_publishers_distinct AS (
              SELECT id, string_agg(publisher, ', ' ORDER BY publisher) AS publishers
              FROM CTE_publishers
              GROUP BY id
            )
            SELECT
              CTE_publications.id AS id,
              CTE_publications.title AS title,
              CTE_countries_distinct.countries AS countries,
              CTE_publications.countries_fingerprint AS countries_fingerprint,
              CTE_publications.year AS year,
              CTE_publishers_distinct.publishers AS publishers,
              CTE_publications.publishers_fingerprint AS publishers_fingerprint,
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
            INNER JOIN
              CTE_publishers_distinct
              ON CTE_publications.id = CTE_publishers_distinct.id
            GROUP BY
              CTE_publications.id,
              CTE_publications.title,
              CTE_publications.year,
              CTE_publications.original_title,
              CTE_publications.translated_book_fingerprint,
              CTE_publications.countries_fingerprint,
              CTE_publications.publishers_fingerprint,
              CTE_authors_distinct.original_authors,
              CTE_translators_distinct.translators,
              CTE_countries_distinct.countries,
              CTE_publishers_distinct.publishers;
            ",
            "-- Down

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
              to_tsvector('simple'::regconfig, publishers)           ||
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
            ALTER COLUMN publisher SET NOT NULL;
            "

    execute "-- Up
            ",
            "-- Down

            UPDATE publications
            SET publisher = (
              SELECT
                string_agg(publishers.name, ', ' ORDER BY publishers.name)
              FROM
                publishers
              INNER JOIN
                publication_publishers
              ON
                publishers.id = publication_publishers.publisher_id
              WHERE
                publication_publishers.publication_id = publications.id
              GROUP BY
                publication_publishers.publication_id
            );
            "

    execute "-- Up

            ALTER TABLE publications
            DROP COLUMN publisher;
            ",
            "-- Down

            ALTER TABLE publications
            ADD publisher VARCHAR;
            "
  end
end
