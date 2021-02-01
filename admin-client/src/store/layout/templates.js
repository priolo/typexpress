import i18n from "../../plugin/i18n"


export const dialogDelete = {
	title: i18n.t("dialog.delete.title"),
	text: i18n.t("dialog.delete.text"),
	labelOk: i18n.t("dialog.delete.ok"),
	labelCancel: i18n.t("dialog.delete.cancel"),
	type: "warning",
}

export const dialogError = {
	title: i18n.t("dialog.error.default.title"),
	text: i18n.t("dialog.error.default.text"),
	labelOk: i18n.t("dialog.error.default.ok"),
	type: "error",
}
