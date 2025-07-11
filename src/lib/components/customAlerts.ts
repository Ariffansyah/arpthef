export function customAlert(message: string) {
	const alertDiv = document.createElement('div');
	alertDiv.className = `
    fixed inset-0 flex items-center justify-center
    bg-black bg-opacity-50 z-[2147483647]
    pointer-events-auto
  `.trim();

	alertDiv.innerHTML = `
    <div class="relative bg-darkgray rounded-lg shadow-lg p-6 max-w-sm w-full">
      <h2 class="text-lg font-semibold mb-4">Alert</h2>
      <p class="mb-4">${message}</p>
      <button
        id="alert-ok-button"
        class="text-white py-2 rounded hover:underline"
      >
        OK
      </button>
    </div>
  `;

	document.body.appendChild(alertDiv);

	const okButton = alertDiv.querySelector('#alert-ok-button');
	okButton?.addEventListener('click', () => {
		document.body.removeChild(alertDiv);
	});

	setTimeout(() => {
		if (document.body.contains(alertDiv)) {
			document.body.removeChild(alertDiv);
		}
	}, 5000);
}
