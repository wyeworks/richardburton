defmodule RichardBurton.Validation do
  @moduledoc """
  Utilities for data validation
  """

  alias RichardBurton.Repo

  def validate(module, attrs) do
    case validate_transaction(module, attrs) do
      {:error, :ok} -> :ok
      {:error, errors} -> {:error, errors}
    end
  end

  defp validate_transaction(module, attrs) do
    Repo.transaction(fn ->
      changeset = module.changeset(Kernel.struct(module, %{}), attrs)

      if changeset.valid? do
        case Repo.insert(changeset) do
          {:ok, _changeset} -> Repo.rollback(:ok)
          {:error, changeset} -> Repo.rollback(get_errors(changeset))
        end
      else
        Repo.rollback(get_errors(changeset))
      end
    end)
  end

  def get_errors(changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(&get_description/1)
    |> coalesce_errors
    |> simplify_errors
  end

  defp get_description({_msg, opts}), do: opts |> Map.new() |> get_description()
  defp get_description(%{validation: :required}), do: :required
  defp get_description(%{validation: :cast, type: type}), do: type
  defp get_description(%{validation: :length, kind: :min, count: 1}), do: :required
  defp get_description(%{validation: :assoc}), do: :required
  defp get_description(%{constraint: :unique}), do: :conflict

  defp simplify_errors(node) when is_map(node) do
    if Kernel.map_size(node) == 1 do
      case node |> Map.values() |> List.first() do
        :conflict -> :conflict
        _ -> node
      end
    else
      node
    end
  end

  defp coalesce_errors(node) when is_map(node) do
    node |> Enum.map(&coalesce_errors/1) |> Map.new()
  end

  defp coalesce_errors({key, value}) when is_atom(key) and (is_map(value) or is_list(value)) do
    {key, coalesce_errors(value)}
  end

  defp coalesce_errors(elements) when is_list(elements) do
    case List.first(elements) do
      node when is_map(node) -> Enum.map(elements, &coalesce_errors/1)
      error when is_atom(error) -> error
    end
  end
end
