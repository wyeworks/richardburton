defmodule RichardBurtonWeb.UserControllerTest do
  @moduledoc """
  Tests for the Publication controller
  """
  use RichardBurtonWeb.ConnCase
  import Routes, only: [user_path: 2]

  @valid_attrs %{"email" => "example@gmail.com"}
  @valid_return %{"email" => "example@gmail.com", "role" => "reader"}

  describe "POST /users" do
    test "when providing valid params, returns 201 created and the inserted user",
         %{conn: conn} do
      expect_auth_verify()
      conn = post(conn, user_path(conn, :create), @valid_attrs)
      assert @valid_return == json_response(conn, 201)
    end

    test "when providing invalid params, returs 400 bad request",
         %{conn: conn} do
      expect_auth_verify()
      conn = post(conn, user_path(conn, :create), %{"email" => nil})
      assert is_nil(json_response(conn, 400))
    end

    test "when providing duplicated params, returns 409 conflict with the inserted user",
         %{conn: conn} do
      expect_auth_verify(3)

      conn = post(conn, user_path(conn, :create), @valid_attrs)
      assert @valid_return == json_response(conn, 201)

      conn = post(conn, user_path(conn, :create), @valid_attrs)
      assert @valid_return == json_response(conn, 409)

      conn =
        post(conn, user_path(conn, :create), %{
          "email" => "example+1@gmail.com",
          "subject_id" => "1245"
        })

      assert @valid_return == json_response(conn, 409)
    end
  end
end
