defmodule RichardBurton.Repo.Migrations.CreateTranslatedBookCompositeKey do
  use Ecto.Migration

  def change do
    create(
      unique_index(:translated_books, [
        :authors,
        :title,
        :year,
        :country,
        :publisher
      ])
    )
  end
end
