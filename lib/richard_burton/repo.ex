defmodule RichardBurton.Repo do
  use Ecto.Repo,
    otp_app: :richard_burton,
    adapter: Ecto.Adapters.Postgres

  def maybe_insert(changeset, keys) do
    %module{} = changeset.data

    changeset
    |> insert()
    |> case do
      {:ok, struct} -> struct
      {:error, _} -> get_by!(module, keys)
    end
  end
end
