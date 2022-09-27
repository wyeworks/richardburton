defmodule RichardBurton.Repo do
  use Ecto.Repo,
    otp_app: :richard_burton,
    adapter: Ecto.Adapters.Postgres

  def maybe_insert(changeset, keys) do
    %module{} = changeset.data

    keyword_list_id =
      changeset.changes
      |> Enum.filter(fn {key, _val} -> Enum.member?(keys, key) end)
      |> Enum.map(&parse_keyword_list_id/1)

    changeset
    |> insert()
    |> case do
      {:ok, struct} -> struct
      {:error, _} -> get_by!(module, keyword_list_id)
    end
  end

  defp parse_keyword_list_id({key, %Ecto.Changeset{} = changeset}) do
    parsed_key =
      key
      |> Atom.to_string()
      |> Kernel.<>("_id")
      |> String.to_existing_atom()

    {parsed_key, changeset.data.id}
  end

  defp parse_keyword_list_id({key, val}) do
    {key, val}
  end
end
