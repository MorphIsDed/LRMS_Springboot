describe("smoke", () => {
  it("loads home", () => {
    cy.visit("/");
    cy.contains("Booking Portal");
  });
});

