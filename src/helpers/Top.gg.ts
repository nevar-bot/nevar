import { AutoPoster } from "topgg-autoposter";

export = {
	init(client: any): void {
		if (
			client.config.apikeys["TOP_GG"] &&
			client.config.apikeys["TOP_GG"] !== "" &&
			client.config.channels["VOTE_ANNOUNCEMENT_ID"] &&
			client.config.channels["VOTE_ANNOUNCEMENT_ID"] !== ""
		) {
			AutoPoster(client.config.apikeys["TOP_GG"], client);
		}
	}
};
