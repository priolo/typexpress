/// <reference types="cypress" />

import {i18n} from "../support/index"


context('Login', () => {

	beforeEach(() => {
		cy.visitSite()
	})

	// https://on.cypress.io/interacting-with-elements
	it('incorrect login', () => {
		cy.contains(".MuiTextField-root",i18n.t("pag.login.username"))
			.find("input").as("intUsername")
		cy.contains(".MuiTextField-root",i18n.t("pag.login.password"))
			.find("input").as("intPassword")


		cy.get('@intUsername')
			.type('wrong').should('have.value', 'wrong')

		cy.get('@intPassword')
			.type('wrong').should('have.value', 'wrong')

		cy.contains("button", i18n.t("pag.login.btt_signin"))
			.click()

		// account not find
		cy.contains(".MuiDialog-paper", i18n.t("dialog.error.400.password_match.title"))
			.find("button").click()

		cy.contains(i18n.t("dialog.error.400.password_match.title")).should('not.be.visible')

	})

	it('correct login', () => {
		cy.contains(".MuiTextField-root",i18n.t("pag.login.username"))
			.find("input").as("intUsername")
		cy.contains(".MuiTextField-root",i18n.t("pag.login.password"))
			.find("input").as("intPassword")

		cy.get('@intUsername')
			.type('admin').should('have.value', 'admin')

		cy.get('@intPassword')
			.type('secret').should('have.value', 'secret')

		cy.contains("button", i18n.t("pag.login.btt_signin"))
			.click()

		cy.contains(i18n.t("app.auth.msg_login")).should('be.visible')

		cy.contains(i18n.t("pag.password.title")).should('be.visible')
	})
})
