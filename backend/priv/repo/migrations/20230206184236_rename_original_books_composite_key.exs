defmodule RichardBurton.Repo.Migrations.RenameOriginalBooksCompositeKey do
  use Ecto.Migration

  def change do
    drop(
      unique_index(
        :original_books,
        [:authors_fingerprint, :title]
      )
    )

    create(
      unique_index(
        :original_books,
        [:title, :authors_fingerprint],
        name: "original_books_composite_key"
      )
    )
  end
end
