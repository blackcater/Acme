// Walk from the element to the root element to find the first element that matches the selector
export function findElementUntilRoot(
	ele: HTMLElement,
	selector: (ele: HTMLElement) => boolean
) {
	let curr: HTMLElement | null = ele
	while (curr) {
		if (selector(curr)) {
			return curr
		}
		curr = curr.parentElement
	}
	return null
}
