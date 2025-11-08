import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/AuthSlice";

export default function ProtectedRoute({ children, ...rest }) {
  const user = useSelector(selectUser);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        user ? children : (
          <Redirect to={{ pathname: "/login", state: { from: location.pathname } }} />
        )
      }
    />
  );
}