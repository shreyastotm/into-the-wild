import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import MobileHamburger from "../MobileHamburger";

describe("MobileHamburger", () => {
  it("renders without crashing", () => {
    render(<MobileHamburger />);
    expect(
      screen.getByText(/MobileHamburger|Submit|Save|Login|Register|Sign/i),
    ).toBeInTheDocument();
  });

  it("handles user interactions", () => {
    const handleClick = vi.fn();
    render(
      <MobileHamburger onClick={handleClick} data-testid="mobilehamburger" />,
    );
    fireEvent.click(screen.getByTestId("mobilehamburger"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("updates state correctly", async () => {
    render(<MobileHamburger data-testid="mobilehamburger" />);
    fireEvent.click(screen.getByTestId("mobilehamburger"));
    await waitFor(() => {
      expect(screen.getByTestId("mobilehamburger")).toHaveTextContent(
        /updated|changed|new/i,
      );
    });
  });
});
