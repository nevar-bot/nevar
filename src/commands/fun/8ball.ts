import BaseCommand from "@structures/BaseCommand";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import BaseClient from "@structures/BaseClient";

const eightBallAnswers: string[] = [
	"Ganz sicher",
	"Ohne Zweifel",
	"Absolut",
	"Ja",
	"Bestimmt",
	"Ganz bestimmt",
	"Mit Sicherheit",
	"Natürlich",
	"Ja, auf jeden Fall",
	"Auf alle Fälle",
	"Sieht gut aus",
	"Ja, es sieht danach aus",
	"Vermutlich",
	"Wahrscheinlich",
	"Ja, es scheint so",
	"Nein",
	"Auf keinen Fall",
	"Ganz sicher nicht",
	"Mit Sicherheit nicht",
	"Definitiv nicht",
	"Nein, auf keinen Fall",
	"Ich denke nicht",
	"Wahrscheinlich nicht",
	"Es sieht nicht danach aus",
	"Vielleicht",
	"Es könnte sein",
	"Kann sein",
	"Schwer zu sagen",
	"Frag mich später nochmal",
	"Besser, wenn du später fragst",
	"Ich bin mir nicht sicher",
	"Ich habe keine Ahnung",
	"Lass mich überlegen",
	"Ich brauche mehr Informationen",
	"Ich muss es nochmal überprüfen",
	"Gibt es eine spezifische Frage dazu?",
	"Konzentriere dich und stelle die Frage nochmal",
	"Ich fühle mich nicht sicher bei dieser Antwort",
	"Es tut mir leid, ich kann jetzt keine Antwort geben",
	"Das kann ich jetzt nicht vorhersagen",
	"Ich habe keine Vision für diese Frage",
	"Ich bin nicht in der Lage, darauf zu antworten",
	"Es tut mir leid, das weiß ich nicht",
	"Ich bin mir nicht sicher, frag mich später nochmal",
	"Es hängt alles von vielen Faktoren ab",
	"Das ist eine komplexe Frage",
	"Ich benötige mehr Zeit zur Überlegung",
	"Lass uns das später besprechen",
	"Das ist eine schwierige Frage",
	"Konzentriere dich und frage nochmal",
	"Ich denke darüber nach",
	"Lass uns später nochmal besprechen",
	"Ich muss mich erst vergewissern",
	"Das sieht nicht gut aus"
];

export default class EightballCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: "8ball",
			description: "Stelle eine Frage und erhalte magische Antworten",
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder().addStringOption((option: any) =>
					option
						.setRequired(true)
						.setName("frage")
						.setDescription("Gib deine Frage ein")
				)
			}
		});
	}

	private interaction: any;
	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		return this.getAnswer();
	}

	private async getAnswer(): Promise<void> {
		const randomAnswer: string =
			eightBallAnswers[
				Math.floor(Math.random() * eightBallAnswers.length)
			];
		const eightBallEmbed: EmbedBuilder = this.client.createEmbed(
			"{0}",
			"question",
			"normal",
			randomAnswer
		);
		return this.interaction.followUp({ embeds: [eightBallEmbed] });
	}
}
