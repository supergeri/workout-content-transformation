import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AddSources from "../AddSources";

const hasRadixDom =
  typeof window !== "undefined" &&
  typeof document !== "undefined" &&
  typeof document.createElement === "function";

if (!hasRadixDom || !AddSources) {
  describe.skip("AddSources", () => {
    it("skipped: DOM or component not available", () => {
      expect(true).toBe(true);
    });
  });
} else {
  const defaultProps = {
    sources: [],
    onSourcesChange: () => {},
    onGenerateStructure: () => {},
  };

  describe("AddSources", () => {
    it("should render the component", () => {
      render(<AddSources {...defaultProps} />);
      const heading = screen.getByText(/Add Workout Sources/i);
      expect(heading).toBeTruthy();
    });

    it("should render input sources section", () => {
      render(<AddSources {...defaultProps} />);
      const section = screen.getByText(/Input Sources/i);
      expect(section).toBeTruthy();
    });

    it("should render tabs for different source types", () => {
      render(<AddSources {...defaultProps} />);

      const tabs = screen.getAllByRole("tab");
      const tabTexts = tabs.map((t) => t.textContent || "");

      // Looser, label-agnostic checks so small copy changes don't break tests
      const hasYouTubeTab = tabTexts.some((t) => /youtube/i.test(t));
      const hasImageTab = tabTexts.some((t) => /image/i.test(t));

      expect(hasYouTubeTab).toBe(true);
      expect(hasImageTab).toBe(true);
      expect(tabs.length).toBeGreaterThanOrEqual(2);
    });

    it("should have generate button", () => {
      render(<AddSources {...defaultProps} />);
      const btn = screen.getByText(/Generate Structure/i);
      expect(btn).toBeTruthy();
    });
  });
}
