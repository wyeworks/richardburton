defmodule RichardBurton.Publisher do
  @moduledoc """
  Schema for publishers
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias RichardBurton.Publisher
  alias RichardBurton.Repo
  alias RichardBurton.Publication
  alias RichardBurton.Util

  @derive {Jason.Encoder, only: [:name]}
  schema "publishers" do
    field(:name, :string)

    many_to_many(:publications, Publication, join_through: "publication_publishers")

    timestamps()
  end

  @doc false
  def changeset(publisher, attrs \\ %{})

  @doc false
  def changeset(publisher, attrs = %Publisher{}) do
    changeset(publisher, Map.from_struct(attrs))
  end

  @doc false
  def changeset(publisher, attrs) do
    publisher
    |> cast(attrs, [:name])
    |> validate_required([:name])
    |> unique_constraint(:name)
  end

  @spec fingerprint(binary() | maybe_improper_list()) :: binary()
  def fingerprint(publishers) when is_binary(publishers) do
    publishers
    |> nest()
    |> Enum.map(fn %{"name" => name} -> %Publisher{name: name} end)
    |> fingerprint()
  end

  def fingerprint(publishers) when is_list(publishers) do
    publishers
    |> Enum.map(fn %Publisher{name: name} -> name end)
    |> Enum.sort()
    |> Enum.join()
    |> Util.create_fingerprint()
  end

  def maybe_insert!(attrs) do
    %__MODULE__{}
    |> changeset(attrs)
    |> Repo.maybe_insert!([:name])
  end

  def all do
    Repo.all(Publisher)
  end

  def link(changeset = %{valid?: true}) do
    publishers =
      changeset
      |> get_change(:publishers)
      |> Enum.map(&apply_changes/1)
      |> Enum.map(&maybe_insert!/1)

    put_assoc(changeset, :publishers, publishers)
  end

  def link(changeset = %{valid?: false}), do: changeset

  def link_fingerprint(changeset = %Ecto.Changeset{valid?: true}) do
    publishers_fingerprint =
      changeset
      |> get_field(:publishers)
      |> fingerprint

    put_change(changeset, :publishers_fingerprint, publishers_fingerprint)
  end

  def link_fingerprint(changeset = %Ecto.Changeset{valid?: false}), do: changeset

  def nest(publishers) when is_binary(publishers) do
    publishers |> String.split(",") |> Enum.map(&%{"name" => String.trim(&1)})
  end

  def flatten(publishers) when is_list(publishers),
    do: Enum.map_join(publishers, ", ", &get_name/1)

  def flatten(publishers), do: publishers

  def get_name(%Publisher{name: name}), do: name
  def get_name(%{"name" => name}), do: name
  def get_name(%{name: name}), do: name
end
