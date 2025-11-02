import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import CostsStep from "../CostsStep";

describe("CostsStep", () => {
  it("renders without crashing", () => {
    render(<CostsStep data-testid="costsstep" />);
    expect(screen.getByTestId("costsstep")).toBeInTheDocument();
  });

  it("accepts and displays props correctly", () => {
    render(<CostsStep title="Test Title" data-testid="costsstep" />);
    expect(screen.getByTestId("costsstep")).toHaveTextContent("Test Title");
  });

  it("handles user interactions", () => {
    const handleClick = vi.fn();
    render(<CostsStep onClick={handleClick} data-testid="costsstep" />);
    fireEvent.click(screen.getByTestId("costsstep"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("updates state correctly", async () => {
    render(<CostsStep data-testid="costsstep" />);
    fireEvent.click(screen.getByTestId("costsstep"));
    await waitFor(() => {
      expect(screen.getByTestId("costsstep")).toHaveTextContent(
        /updated|changed|new/i,
      );
    });
  });
});
