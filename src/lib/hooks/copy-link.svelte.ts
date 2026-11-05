export function useCopyLink() {
	let copied = $state(false);

	function copy(url: string) {
		navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	return {
		get copied() {
			return copied;
		},
		copy
	};
}
