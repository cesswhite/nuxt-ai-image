/** JSON shape from `POST /api/text/enhance-prompt` and `surprise-prompt`. */
export type TextAssistSuccess = { success: true, data: { text: string } }
export type TextAssistFailure = { success: false, error?: string }
export type TextAssistResult = TextAssistSuccess | TextAssistFailure
