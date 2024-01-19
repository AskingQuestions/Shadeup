import ts from 'typescript';

export function nicerError(e: ts.DiagnosticMessageChain | ts.DiagnosticRelatedInformation) {
	if (e.code == 1070) {
		return 'Static/public methods are not supported on traits';
	}

	return e.messageText.toString();
}
