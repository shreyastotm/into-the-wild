import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import TravelCoordination from "../TravelCoordination";

// Wrapper for Router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("TravelCoordination", () => {
  it("renders without crashing", () => {
    renderWithRouter(<TravelCoordination data-testid="travelcoordination" />);
    expect(screen.getByTestId("travelcoordination")).toBeInTheDocument();
  });

  it("accepts and displays props correctly", () => {
    renderWithRouter(
      <TravelCoordination
        title="Test Title"
        data-testid="travelcoordination"
      />,
    );
    expect(screen.getByTestId("travelcoordination")).toHaveTextContent(
      "Test Title",
    );
  });

  it("handles user interactions", () => {
    const handleClick = vi.fn();
    renderWithRouter(
      <TravelCoordination
        onClick={handleClick}
        data-testid="travelcoordination"
      />,
    );
    fireEvent.click(screen.getByTestId("travelcoordination"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("updates state correctly", async () => {
    renderWithRouter(<TravelCoordination data-testid="travelcoordination" />);
    fireEvent.click(screen.getByTestId("travelcoordination"));
    await waitFor(() => {
      expect(screen.getByTestId("travelcoordination")).toHaveTextContent(
        /updated|changed|new/i,
      );
    });
  });
});
