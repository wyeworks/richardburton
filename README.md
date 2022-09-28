# RichardBurton

This app is a repository that mantains data of English translations of brazilian literature books.

# Domain

`Original book` represent a Brazilian literature book

- has one `title`
- has many `authors`
- is identified by its `title` and its `authors`

`Translated book` represents an English translation of `Original book`

- has one `original book`
- has many `authors`
- has many `publications` (the same publication, republished)
- is identified by its `authors` and its `original book`

`Publication` is a single publication of a translated book

- has one `title`
- has one `country`
- has one `year`
- has one `publisher`
- is identified by all of its fields

`Author` is the author of a book, be it original or translated

- has one `name`
- is identified by its `name`

# Starting the server

To start your Phoenix server:

- Start your `postgres` database (configured as specified in `config/dev.ex`)
- Install dependencies with `mix deps.get`
- Create and migrate your database with `mix ecto.setup`
- Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

# Initializing the database

This app provides a mix task to initialize the database from a CSV file, `data.csv` placed on the project's root directory. This project should already include such file. Run the task with `mix rb.load_data`.

A `data.csv` entry is a `Publication`, with their associated entities embedded. The fields, ordered, are:

- `original book authors` (separated by `and`)
- `publication year`
- `publication country`
- `original book title`
- `publication title`
- `publication authors` (separated by `and`)
- `publication publisher`
