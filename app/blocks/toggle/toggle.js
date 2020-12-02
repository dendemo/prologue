function Toggle({
	elementParent,
	classToggle
}) {
	const toggle = document.querySelector('.toggle');

	toggle.addEventListener('click', function() {
		elementParent.classList.toggle(classToggle);
	})
};

export {Toggle as default};