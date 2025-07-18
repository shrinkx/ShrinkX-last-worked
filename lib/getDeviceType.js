export const getDeviceType = () => {
	const ua = navigator.userAgent;

	if (/Mobi|Android/i.test(ua)) return "mobile";
	if (/Tablet|iPad/i.test(ua)) return "tablet";
	return "desktop";
}
