import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import button from "../button";

describe("button", () => {
  it("renders without crashing", () => {
    render(<button data-testid="button" />);
    expect(screen.getByTestId("button")).toBeInTheDocument();
  });

  it("accepts and displays props correctly", () => {
    render(<button title="Test Title" data-testid="button" />);
    expect(screen.getByTestId("button")).toHaveTextContent("Test Title");
  });
});
