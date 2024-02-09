import BaseCommand from "@structures/BaseCommand.js";
import BaseClient from "@structures/BaseClient.js";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";
import path from "path";

export default class WeatherCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "weather",
			description: "View the weather for a specific location",
			localizedDescriptions: {
				de: "Lasse dir das Wetter für einen bestimmten Ort anzeigen",
			},
			cooldown: 1000,
			dirname: import.meta.url,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option) =>
					option
						.setName("city")
						.setNameLocalization("de", "stadt")
						.setDescription("Specify a location or city")
						.setDescriptionLocalization("de", "Gib einen Ort oder eine Stadt an")
						.setRequired(true),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		this.data = data;
		await this.showWeather(interaction.options.getString("city"));
	}

	private async showWeather(city: string): Promise<any> {
		if (!this.client.config.apikeys["WEATHER"] || this.client.config.apikeys["WEATHER"] === "") {
			const noApiKeyEmbed: EmbedBuilder = this.client.createEmbed(
				this.getBasicTranslation("errors:unexpected", { support: this.client.support }),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noApiKeyEmbed] });
		}
		if (!city) {
			const noCityEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:locationOrCityIsMissing"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noCityEmbed] });
		}

		const weatherInformation = (
			await axios.get(
				"https://api.openweathermap.org/data/2.5/weather?q=" +
					encodeURI(city) +
					"&appid=" +
					this.client.config.apikeys["WEATHER"] +
					"&lang=" + this.data.guild.locale + "&units=metric",
				{
					validateStatus: (): boolean => true,
				},
			)
		).data;

		if (weatherInformation?.cod === 200) {
			const weather: any = {
				description: weatherInformation.weather[0].description,
				temp: Math.round(weatherInformation.main.temp),
				tempMin: Math.round(weatherInformation.main.temp_min),
				tempMax: Math.round(weatherInformation.main.temp_max),
				tempFeelsLike: Math.round(weatherInformation.main.feels_like),
				humidity: weatherInformation.main.humidity,
				wind: {
					ms: weatherInformation.wind.speed,
					kmh: Math.round(weatherInformation.wind.speed * 3.6),
				},
				sunrise: this.client.utils.getDiscordTimestamp(new Date(weatherInformation.sys.sunrise * 1000), "t"),
				sunset: this.client.utils.getDiscordTimestamp(new Date(weatherInformation.sys.sunset * 1000), "t"),
			};

			const text: string =
				this.client.emotes.bright + " " +
				this.translate("temperature") + ": " +
				weather.temp +
				"°C (" +
				weather.tempMin +
				"°C /" +
				weather.tempMax +
				"°C /" +
				weather.tempFeelsLike +
				"°C)\n\n" +
				this.client.emotes.text + " " +
				this.translate("humidity") + ": " +
				weather.humidity +
				"%\n\n" +
				this.client.emotes.strike + " " +
				this.translate("windSpeed") + ": " +
				weather.wind.kmh +
				this.translate("speedUnit:kph") +
				" (" +
				weather.wind.ms +
				this.translate("speedUnit:mps") +
				")\n\n" +
				this.client.emotes.shine + " " +
				this.translate("sunrise") + ": " +
				weather.sunrise +
				"\n" +
				this.client.emotes.shine2 + " " +
				this.translate("sunset") + ": " +
				weather.sunset;

			const weatherEmbed: EmbedBuilder = this.client.createEmbed(text, null, "normal");
			weatherEmbed.setTitle(weatherInformation.name + ": " + weather.description);

			return this.interaction.followUp({ embeds: [weatherEmbed] });
		} else {
			const errorEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:givenLocationIsNotFound"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
