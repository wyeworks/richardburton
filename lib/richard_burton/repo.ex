defmodule RichardBurton.Repo do
  use Ecto.Repo,
    otp_app: :richard_burton,
    adapter: Ecto.Adapters.Postgres

  def maybe_insert(changeset, keys) do
    %module{} = changeset.data

    changeset
    |> __MODULE__.insert()
    |> case do
      {:ok, book} -> book
      {:error, _} -> __MODULE__.get_by!(module, keys)
    end
  end
end
