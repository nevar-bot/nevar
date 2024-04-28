import { AutoPoster } from "topgg-autoposter";

export class TopggManager {
	public constructor(client: any) {
		if (client.config.apikeys["TOP_GG"] && client.config.apikeys["TOP_GG"] !== "") {
			AutoPoster(client.config.apikeys["TOP_GG"], client);
		}
	}
}