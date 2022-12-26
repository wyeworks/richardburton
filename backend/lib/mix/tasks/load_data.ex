defmodule Mix.Tasks.Rb.LoadData do
  @moduledoc """
  Mix task to initialize the repo using a data.csv file in the project's root directory
  """
  use Mix.Task

  alias RichardBurton.Publication
  alias RichardBurton.PublicationCodec

  def run(_) do
    Mix.Task.run("app.start")

    File.cwd!()
    |> Path.join('data.csv')
    |> PublicationCodec.from_csv!()
    |> Enum.map(&Publication.insert/1)
  end
end
