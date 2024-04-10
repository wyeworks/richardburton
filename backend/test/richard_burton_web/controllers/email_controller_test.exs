defmodule RichardBurtonWeb.EmailControllerTest do
  @moduledoc """
  Tests for the Email controller
  """
  use RichardBurtonWeb.ConnCase
  import Routes, only: [email_path: 2]

  describe "POST /contact" do
    test "returns 200 and a success message when all the fields are sent", %{conn: conn} do
      expect_auth_recaptcha_verify(1)
      expect_mailer_send(2)

      params = %{
        "name" => "João Silva",
        "institution" => "IFRS Canoas",
        "address" => "johndoe@canoas.ifrs.edu.br",
        "subject" => "Olá",
        "message" => "Olá, mundo!",
        "recaptcha_token" => "token"
      }

      conn = post(conn, email_path(conn, :contact), params)

      assert %{"message" => "Email sent."} == json_response(conn, 200)
    end

    test "returns 200 and a success message when only the institution is omitted", %{conn: conn} do
      expect_auth_recaptcha_verify(1)
      expect_mailer_send(2)

      params = %{
        "name" => "João Silva",
        "address" => "johndoe@canoas.ifrs.edu.br",
        "subject" => "Olá",
        "message" => "Olá, mundo!",
        "recaptcha_token" => "token"
      }

      conn = post(conn, email_path(conn, :contact), params)

      assert %{"message" => "Email sent."} == json_response(conn, 200)
    end

    test "returns 400 when the sender's name is omitted", %{conn: conn} do
      expect_auth_recaptcha_verify(1)
      expect_mailer_send(0)

      params = %{
        "address" => "johndoe@canoas.ifrs.edu.br",
        "subject" => "Olá",
        "message" => "Olá, mundo!",
        "recaptcha_token" => "token"
      }

      conn = post(conn, email_path(conn, :contact), params)

      assert %{"issues" => %{"name" => "required"}} == json_response(conn, 400)
    end

    test "returns 400 when the sender's email is omitted", %{conn: conn} do
      expect_auth_recaptcha_verify(1)
      expect_mailer_send(0)

      params = %{
        "name" => "João Silva",
        "subject" => "Olá",
        "message" => "Olá, mundo!",
        "recaptcha_token" => "token"
      }

      conn = post(conn, email_path(conn, :contact), params)

      assert %{"issues" => %{"address" => "required"}} == json_response(conn, 400)
    end

    test "returns 400 when the sender's email is invalid", %{conn: conn} do
      expect_auth_recaptcha_verify(1)
      expect_mailer_send(0)

      params = %{
        "name" => "João Silva",
        "address" => "a",
        "subject" => "Olá",
        "message" => "Olá, mundo!",
        "recaptcha_token" => "token"
      }

      conn = post(conn, email_path(conn, :contact), params)

      assert %{"issues" => %{"address" => "invalid"}} == json_response(conn, 400)
    end

    test "returns 400 when the subject is omitted", %{conn: conn} do
      expect_auth_recaptcha_verify(1)
      expect_mailer_send(0)

      params = %{
        "name" => "João Silva",
        "address" => "johndoe@canoas.ifrs.edu.br",
        "message" => "Olá, mundo!",
        "recaptcha_token" => "token"
      }

      conn = post(conn, email_path(conn, :contact), params)

      assert %{"issues" => %{"subject" => "required"}} == json_response(conn, 400)
    end

    test "returns 400 when the message is omitted", %{conn: conn} do
      expect_auth_recaptcha_verify(1)
      expect_mailer_send(0)

      params = %{
        "name" => "João Silva",
        "address" => "johndoe@canoas.ifrs.edu.br",
        "subject" => "Olá",
        "recaptcha_token" => "token"
      }

      conn = post(conn, email_path(conn, :contact), params)

      assert %{"issues" => %{"message" => "required"}} == json_response(conn, 400)
    end

    test "returns 401 when the recaptcha token is omitted", %{conn: conn} do
      expect_auth_recaptcha_verify(0)
      expect_mailer_send(0)

      params = %{
        "name" => "João Silva",
        "address" => "johndoe@canoas.ifrs.edu.br",
        "subject" => "Olá",
        "message" => "Olá, mundo!"
      }

      conn = post(conn, email_path(conn, :contact), params)

      assert "Unauthorized, recaptcha token is invalid" = response(conn, 401)
    end
  end
end
