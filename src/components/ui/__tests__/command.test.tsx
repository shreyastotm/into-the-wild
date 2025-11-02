import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import command from "../command";

describe("command", () => {
  it("renders without crashing", () => {
    render(<command data-testid="command" />);
    expect(screen.getByTestId("command")).toBeInTheDocument();
  });

  it("accepts and displays props correctly", () => {
    render(<command title="Test Title" data-testid="command" />);
    expect(screen.getByTestId("command")).toHaveTextContent("Test Title");
  });
});
