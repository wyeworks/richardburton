# RichardBurton

This app is a repository that mantains data of English translations of brazilian literature books.

Access backend app docs [here](https://wyeworks.github.io/richardburton)

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

You must have Node, NPM, Erlang, Elixir installed and a Postgres database configured as specified in [`backend/config/dev.ex`](https://github.com/wyeworks/richardburton/blob/main/backend/config/dev.exs).

We recommend using `asdf` to manage Elixir and Erlang versions, which are specified for this project in [`backend/.tool-versions`](https://github.com/wyeworks/richardburton/blob/main/backend/.tool-versions)

## To start the backend server:

- Start your `postgres` database
- Navigate to the `backend` folder
- Install dependencies with `mix deps.get`
- Create and migrate your database with `mix ecto.setup`
- Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## To start the frontend server:

- Navigate to the `frontend` folder
- Set the environment variables in your `.env` or `.env.development` file:
- Install dependencies with `npm i`
- Start NextJS server with `npm run dev`

Now you can visit [`localhost:3000`](http://localhost:3000) from your browser.

### Environment Variables

| Key                   | Description                   | Recommended value for dev   |
| --------------------- | ----------------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | URL of the backend server API | `http://localhost:4000/api` |

## Deployment

Ready to run in production? Please check the deployment guides for [NextJS](https://nextjs.org/docs/deployment) and [Phoenix](https://hexdocs.pm/phoenix/deployment.html).

# Initializing the database

This app provides a mix task to initialize the database from a CSV file, `data.csv` placed on the project's root directory. This project should already include such file. Run the task with `mix rb.load_data`.

A `data.csv` entry is a `Publication`, with their associated entities embedded. The fields, ordered, are:

- `original book authors` (separated by commas)
- `publication year`
- `publication country`
- `original book title`
- `publication title`
- `publication authors` (separated by commas)
- `publication publisher`
