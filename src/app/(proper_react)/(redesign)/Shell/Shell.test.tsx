/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { it, expect } from "@jest/globals";
import { render } from "@testing-library/react";
import { composeStory } from "@storybook/react";
import { axe } from "jest-axe";
import Meta, {
  ShellAuthenticated,
  ShellAuthenticatedRedesign,
} from "./Shell.stories";

describe("ShellAuthenticated", () => {
  it("passes the axe accessibility test suite", async () => {
    const ShellComponent = composeStory(ShellAuthenticated, Meta);
    const { container } = render(<ShellComponent />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ShellAuthenticatedRedesign", () => {
  it("passes the axe accessibility test suite", async () => {
    const ShellComponent = composeStory(ShellAuthenticatedRedesign, Meta);
    const { container } = render(<ShellComponent />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
