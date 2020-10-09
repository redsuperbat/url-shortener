const app = {
	data: () => ({
		url: "",
		slug: "",
		response: null,
		showAnchor: false,
	}),
	methods: {
		async createUrl() {
			this.showAnchor = false;
			const res = await fetch("/", {
				method: "POST",
				body: JSON.stringify({ url: this.url, slug: this.slug }),
				headers: {
					"content-type": "application/json",
				},
			});
			const parsed = await res.json();
			if (res.status >= 400) {
				this.response = parsed.message;
			} else {
				this.response = parsed.fullUrl;
				this.showAnchor = true;
			}
		},
	},
};

Vue.createApp(app).mount("#app");
