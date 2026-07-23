export function customAlert(message: string) {
	const overlay = document.createElement('div');
	overlay.style.cssText = [
		'position:fixed',
		'inset:0',
		'display:flex',
		'align-items:center',
		'justify-content:center',
		'background:color-mix(in srgb, #0c1844 55%, transparent)',
		'z-index:2147483647',
		'padding:1rem'
	].join(';');

	const card = document.createElement('div');
	card.style.cssText = [
		'position:relative',
		'max-width:24rem',
		'width:100%',
		'padding:1.5rem',
		'background:var(--card)',
		'color:var(--ink)',
		'border:1px solid var(--edge-strong)',
		'border-radius:0.5rem',
		'box-shadow:0 10px 30px rgba(12, 24, 68, 0.35)',
		"font-family:'Fira Code', monospace"
	].join(';');

	const heading = document.createElement('h2');
	heading.textContent = 'Alert';
	heading.style.cssText =
		'font-size:1.125rem;font-weight:700;margin:0 0 1rem;color:var(--brand)';

	const body = document.createElement('p');
	body.textContent = message;
	body.style.cssText = 'margin:0 0 1rem;color:var(--ink-muted)';

	const button = document.createElement('button');
	button.textContent = 'OK';
	button.style.cssText = [
		'padding:0.5rem 1.25rem',
		'background:var(--cta)',
		'color:var(--cta-ink)',
		'border:none',
		'border-radius:0.375rem',
		'font-weight:700',
		'cursor:pointer'
	].join(';');

	card.append(heading, body, button);
	overlay.append(card);
	document.body.appendChild(overlay);

	const remove = () => {
		if (document.body.contains(overlay)) document.body.removeChild(overlay);
	};

	button.addEventListener('click', remove);
	setTimeout(remove, 5000);
}
