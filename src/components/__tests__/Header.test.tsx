import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import Header from "../Header";

describe("Header", () => {
  it("renders without crashing", () => {
    render(<Header />);
    expect(
      screen.getByText(/Header|Submit|Save|Login|Register|Sign/i),
    ).toBeInTheDocument();
  });

  it("handles user interactions", () => {
    const handleClick = vi.fn();
    render(<Header onClick={handleClick} data-testid="header" />);
    fireEvent.click(screen.getByTestId("header"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("updates state correctly", async () => {
    render(<Header data-testid="header" />);
    fireEvent.click(screen.getByTestId("header"));
    await waitFor(() => {
      expect(screen.getByTestId("header")).toHaveTextContent(
        /updated|changed|new/i,
      );
    });
  });
});
