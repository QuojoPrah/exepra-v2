// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";

describe("Price", () => {
  it("shows sale and original price with accessible labels", () => {
    render(<Price price={7900} compareAt={9900} showDiscount />);
    expect(screen.getByText("Sale price")).toBeInTheDocument();
    expect(screen.getByText("Original price")).toBeInTheDocument();
    expect(screen.getByText("−20%")).toBeInTheDocument();
  });
  it("shows a regular price without sale markup", () => {
    render(<Price price={4900} />);
    expect(screen.queryByText("Sale price")).not.toBeInTheDocument();
  });
});

describe("Stars", () => {
  it("exposes the rating to screen readers", () => {
    render(<Stars rating={4.5} />);
    expect(screen.getByRole("img", { name: "4.5 out of 5 stars" })).toBeInTheDocument();
  });
});
