defmodule RichardBurton.Repo do
  use Ecto.Repo,
    otp_app: :richard_burton,
    adapter: Ecto.Adapters.Postgres

  def maybe_insert!(changeset, unique_key) do
    keyword_list_id =
      changeset.changes
      |> Enum.filter(fn {key, _val} -> Enum.member?(unique_key, key) end)
      |> Enum.map(&parse_keyword_list_id/1)

    insert!(
      changeset,
      on_conflict: [set: keyword_list_id],
      conflict_target: Keyword.keys(keyword_list_id),
      returning: true
    )
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
