defmodule RichardBurton.PublisherTest do
  @moduledoc """
  Tests for the Publisher schema
  """
  use RichardBurton.DataCase

  alias RichardBurton.Publisher
  alias RichardBurton.Validation
  alias RichardBurton.Util

  defmodule WithManyPublishers do
    use Ecto.Schema
    import Ecto.Changeset

    schema "with_many_publishers" do
      field(:publishers_fingerprint, :string)
      has_many :publishers, Publisher
    end

    def changeset(attrs) do
      %WithManyPublishers{} |> cast(attrs, []) |> cast_assoc(:publishers)
    end
  end

  @valid_attrs %{
    "name" => "Noonday Press"
  }

  defp changeset(attrs = %{}) do
    Publisher.changeset(%Publisher{}, attrs)
  end

  defp change_valid(attrs = %{}) do
    changeset(Util.deep_merge_maps(@valid_attrs, attrs))
  end

  defp insert(attrs) do
    %Publisher{} |> Publisher.changeset(attrs) |> Repo.insert()
  end

  defp insert!(attrs) do
    attrs |> changeset() |> Repo.insert!()
  end

  defp get_publishers(changeset = %Ecto.Changeset{}) do
    changeset
    |> get_change(:publishers)
    |> Enum.map(&apply_changes/1)
  end

  defp get_fingerprint(changeset = %Ecto.Changeset{}) do
    get_change(changeset, :publishers_fingerprint)
  end

  describe "changeset/2" do
    test "when valid attributes are provided, is valid" do
      assert changeset(@valid_attrs).valid?
    end

    test "when name is blank, is invalid" do
      refute change_valid(%{"name" => ""}).valid?
    end

    test "when name is nil, is invalid" do
      refute change_valid(%{"name" => nil}).valid?
    end

    test "when name is a non-blank string, is valid" do
      assert change_valid(%{"name" => "Bickers & SonA"}).valid?
    end

    test "when a publisher with the provided attributes already exists, is invalid" do
      {:ok, _} = insert(@valid_attrs)
      {:error, changeset} = insert(@valid_attrs)

      refute changeset.valid?
      assert :conflict == Validation.get_errors(changeset)
    end
  end

  describe "maybe_insert/1" do
    test "when there is no publisher with the provided name, inserts it" do
      publisher = Publisher.maybe_insert!(@valid_attrs)

      assert [publisher] == Publisher.all()
    end

    test "when there is a publisher with the provided name, returns the pre-existent one" do
      insert(@valid_attrs)
      assert [preexistent_publisher] = Publisher.all()

      publisher = Publisher.maybe_insert!(@valid_attrs)

      assert preexistent_publisher == publisher
      assert [publisher] == Publisher.all()
    end
  end

  describe "fingerprint/1" do
    test "given two different lists of publishers, generates different fingerprints" do
      publishers1 = [%Publisher{name: "Noonday Press"}, %Publisher{name: "Bickers & Son"}]
      publishers2 = [%Publisher{name: "Bickers & Son"}, %Publisher{name: "IE"}]

      refute Publisher.fingerprint(publishers1) == Publisher.fingerprint(publishers2)
    end

    test "given two lists of publishers with the same names, generates the same fingerprints" do
      publishers1 = [%Publisher{name: "Noonday Press"}, %Publisher{name: "Bickers & Son"}]
      publishers2 = [%Publisher{name: "Noonday Press"}, %Publisher{name: "Bickers & Son"}]

      assert Publisher.fingerprint(publishers1) == Publisher.fingerprint(publishers2)
    end

    test "given two lists of publishers with the same and different order, generates the same fingerprints" do
      publishers1 = [%Publisher{name: "Noonday Press"}, %Publisher{name: "Bickers & Son"}]
      publishers2 = [%Publisher{name: "Bickers & Son"}, %Publisher{name: "Noonday Press"}]

      assert Publisher.fingerprint(publishers1) == Publisher.fingerprint(publishers2)
    end
  end

  describe "link/1" do
    test "links existing publishers to changeset" do
      attrs = %{
        "publishers" => [
          %{"name" => "Noonday Press"},
          %{"name" => "Bickers & Son"}
        ]
      }

      publishers = Enum.map(attrs["publishers"], &insert!/1)

      changeset =
        attrs
        |> WithManyPublishers.changeset()
        |> Publisher.link()

      assert changeset.valid?
      assert publishers == get_publishers(changeset)
    end

    test "links non-existing publishers to changeset, inserting them" do
      attrs = %{
        "publishers" => [
          %{"name" => "Noonday Press"},
          %{"name" => "Bickers & Son"}
        ]
      }

      changeset =
        attrs
        |> WithManyPublishers.changeset()
        |> Publisher.link()

      assert changeset.valid?
      assert Publisher.all() == get_publishers(changeset)
    end

    test "has no side effects when changeset is invalid" do
      changeset =
        %{"publishers" => [%{}]}
        |> WithManyPublishers.changeset()
        |> Publisher.link()

      refute changeset.valid?
      assert Enum.empty?(Publisher.all())
    end
  end

  describe "link_fingerprint/1" do
    test "links fingerprint Bickers & Soning publisher names to changeset" do
      attrs = %{
        "publishers" => [
          %{"name" => "Noonday Press"},
          %{"name" => "Bickers & Son"}
        ]
      }

      changeset =
        attrs
        |> WithManyPublishers.changeset()
        |> Publisher.link_fingerprint()

      assert changeset.valid?
      assert Publisher.fingerprint(get_publishers(changeset)) == get_fingerprint(changeset)
    end

    test "does not link fingerprint to invalid changeset" do
      changeset =
        %{"publishers" => [%{}]}
        |> WithManyPublishers.changeset()
        |> Publisher.link_fingerprint()

      refute changeset.valid?
      assert is_nil(get_fingerprint(changeset))
    end
  end

  describe "flatten/1" do
    test "with a list of maps with string keys, returns a list of maps with name key" do
      publishers = [
        %{"name" => "Noonday Press"},
        %{"name" => "Bickers & Son"}
      ]

      assert "Noonday Press, Bickers & Son" = Publisher.flatten(publishers)
    end

    test "with a list of maps with atom keys, returns a list of maps with name key" do
      publishers = [
        %{name: "Noonday Press"},
        %{name: "Bickers & Son"}
      ]

      assert "Noonday Press, Bickers & Son" = Publisher.flatten(publishers)
    end

    test "with a list of Publisher structs, returns a list of maps with name key" do
      publishers = [
        %Publisher{name: "Noonday Press"},
        %Publisher{name: "Bickers & Son"}
      ]

      assert "Noonday Press, Bickers & Son" = Publisher.flatten(publishers)
    end
  end

  describe "nest/1" do
    test "with a comma separated string, returns a list of maps with name key" do
      publishers = "Noonday Press, Bickers & Son"

      assert [%{"name" => "Noonday Press"}, %{"name" => "Bickers & Son"}] =
               Publisher.nest(publishers)
    end
  end
end
