import BaseCommand from "@structures/BaseCommand";
import BaseClient from "@structures/BaseClient";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import axios from "axios";

export default class WeatherCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "weather",
			description: "View the weather for a specific location",
			localizedDescriptions: {
				de: "Lasse dir das Wetter für einen bestimmten Ort anzeigen",
			},
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option) =>
					option
						.setName("city")
						.setNameLocalizations({
							de: "stadt"
						})
						.setDescription("Specify a location or city")
						.setDescriptionLocalizations({
							de: "Gib einen Ort oder Stadt an"
						})
						.setRequired(true),
				),
			},
		});
	}


	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		this.guild = interaction.guild;
		await this.showWeather(interaction.options.getString("city"), data);
	}

	private async showWeather(city: string, data: any): Promise<any> {
		if (!this.client.config.apikeys["WEATHER"] || this.client.config.apikeys["WEATHER"] === "") {
			const noApiKeyEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("basics:errors:unexpected", { support: this.client.support }, true),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [noApiKeyEmbed] });
		}
		if (!city) {
			const noCityEmbed: EmbedBuilder = this.client.createEmbed(
				this.translate("errors:missingLocationOrCity"),
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
					"&lang=" + data.guild.locale + "&units=metric",
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
				sunrise: new Date(weatherInformation.sys.sunrise * 1000).toLocaleTimeString("de-DE"),
				sunset: new Date(weatherInformation.sys.sunset * 1000).toLocaleTimeString("de-DE"),
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
				this.translate("errors:locationNotFound"),
				"error",
				"error",
			);
			return this.interaction.followUp({ embeds: [errorEmbed] });
		}
	}
}
