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

# Auth

## Authentication

Authentication is currently implemented using Google as identity provider. The OAuth2 flow is implemented in the frontend server using [NextAuth](https://next-auth.js.org/). To integrate with your environment, you should follow these steps:

1. create a new project in the [Google Cloud Console](https://console.cloud.google.com/apis/dashboard);
2. configure the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) in order to generate the credentials;
3. create new [OAuth2 credentials](https://console.cloud.google.com/apis/credentials), ideally one per environment, setting the site's canonical URL as allowed JavaScript origin and the `/api/auth/callback/google` api path as allowed redirect URI;
4. and generate OAuth2 credentials through the [credentials dashboard](https://console.cloud.google.com/apis/credentials). You will need to configure the OAuth consent screen in order to generate the credentials. This will generate a brand new Google OAuth2 Client whose Client ID and Secret must be passed to the app via [environment variables](#environment-variables).

Authentication is achieved with JSON Web Tokens (JWT). An id token is retrieved and stored on sign in by the frontend server using Google's OAuth2 flow. The whole authentication flow is performed by the frontend server, which forwards the access token to the browser so it can do further client-side requests. The access token is sent to the backend server on each request via authorization header for verification.

The id token is verified in the backend server checking its issuer (that can be retrieved from [Google's well-known OpenId Configuration](https://accounts.google.com/.well-known/openid-configuration)); its audience (the configured Google OAuth2 client, identified by its id); and its cryptographic signature (using one of [Google's OAuth2 certificates](https://www.googleapis.com/oauth2/v2/certs) as public key).

The [OpenId configuration](https://accounts.google.com/.well-known/openid-configuration) and the [OAuth2 certificates](https://www.googleapis.com/oauth2/v2/certs)) are referred as auth configuration. This configuration is fetched and stored in the application's environment on the backend server's startup. Although is unlikely for these to change, a stale configuration situation can be solved by restarting the server.

## Authorization

Authorization is role-based, and the domain defines three user roles: `admin`, `contributor` and `reader`. Currently, `admin` is the only relevant role, being the only one allowed to sign into the app. Every endpoint is secured behind the authorization layer, except `GET /publications`. The only endpoint that does not require `admin` privileges is `POST /users`. However, it requires authentication, and will only allow to operate on the authenticated user ([see more](#user-creation)). Authorization is also performed in the frontend, as non-admin users to won't be able to procede with sign in once their role is verified.

## User creation

Users are created automatically on their sign in, with the `reader` role by default. Only `email`, `subject_id` and `role` are stored. The `subject_id` is an identifier provided by google and serves as the user's key: email addresses and their plus-sign aliases, like `example@gmail.com` and `example+richardburton@gmail.com` are linked to the same `subject_id` and won't trigger redudant user creation that could be exploited. The only way to change a user's role is through the database.

Users are retrieved during the sign in process for role verification in a "get or insert" fashion: a `POST /users` is issued once the id token is received from google. The expected outcome is a `201 CREATED` response with the user data (`email` and `role`) on the first sign in; and a `409 CONFLICT` response with the user data (`email` and `role`) if a user with the `subject_id` present in the id token already exists. Other responses will interrupt the sign in flow.

# Environment Variables

## Frontend

Define the following environment variables on a `.env` file in the `frontend` folder. Format is `KEY=VALUE`, one pair per line.

```
KEY1=value1
KEY2=value2
```

| Key                    | Description                                                                                              | Recommended value for dev                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | URL of the backend server API                                                                            | `http://localhost:4000/api`                                                                                 |
| `NEXTAUTH_URL`         | The canonical URL of the site ([read more](https://next-auth.js.org/configuration/options#nextauth_url)) | `http://localhost:3000`                                                                                     |
| `NEXTAUTH_SECRET`      | Secret for JWT encryption.                                                                               | Generate with `openssl rand -base64 32`                                                                     |
| `GOOGLE_CLIENT_ID`     | Google OAuth2 client id                                                                                  | Get from [google](https://console.cloud.google.com/apis/credentials), see [authentication](#authentication) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret                                                                              | Get from [google](https://console.cloud.google.com/apis/credentials), see [authentication](#authentication) |

## Backend

Define the following environment variables on a `dev.secrets.exs` file inside the `backend/config` folder. Format is as keyword arguments to a `config :richard_burton` function.

```elixir
config :richard_burton, key1: value1, key2: value2
```

| Key                        | Description                          | Recommended value for dev                                      |
| -------------------------- | ------------------------------------ | -------------------------------------------------------------- |
| `google_client_id`         | URL of the backend server API        | `http://localhost:4000/api`                                    |
| `google_openid_config_url` | URL of Google's OpenId configuration | `https://accounts.google.com/.well-known/openid-configuration` |
| `google_oauth2_certs_url`  | URL of Google's OAuth2 certificates  | `https://www.googleapis.com/oauth2/v2/certs`                   |

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

| Key                     | Description                     | Recommended value for dev     |
| ----------------------- | ------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`   | URL of the backend server API   | `http://localhost:4000/api`   |
| `NEXT_PUBLIC_FILES_URL` | URL of the backend server files | `http://localhost:4000/files` |

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
