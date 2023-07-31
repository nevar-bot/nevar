/** @format */

import BaseCommand from '@structures/BaseCommand';
import BaseClient from '@structures/BaseClient';
import {
	SlashCommandBuilder,
	EmbedBuilder,
	Embed,
	ButtonBuilder
} from 'discord.js';
import moment from 'moment';
import ems from 'enhanced-ms';
const ms: any = ems('de');

export default class MuteCommand extends BaseCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'mute',
			description: 'Mutet ein Mitglied für eine bestimmte Zeit',
			memberPermissions: ['ManageRoles', 'ModerateMembers'],
			botPermissions: ['ManageRoles'],
			cooldown: 1000,
			dirname: __dirname,
			slashCommand: {
				addCommand: true,
				data: new SlashCommandBuilder()
					.addUserOption((option: any) =>
						option
							.setName('mitglied')
							.setDescription('Wähle ein Mitglied')
							.setRequired(true)
					)
					.addStringOption((option: any) =>
						option
							.setName('grund')
							.setDescription('Gib einen Grund an')
							.setRequired(false)
					)
					.addStringOption((option: any) =>
						option
							.setName('dauer')
							.setDescription(
								'Gib eine Dauer an (bspw. 1h, 1d, 1h 30m, etc.)'
							)
							.setRequired(false)
					)
			}
		});
	}

	private interaction: any;

	public async dispatch(interaction: any, data: any): Promise<void> {
		this.interaction = interaction;
		await this.mute(
			interaction.options.getUser('mitglied'),
			interaction.options.getString('grund'),
			interaction.options.getString('dauer'),
			data
		);
	}

	private async mute(
		member: any,
		reason: string,
		duration: string,
		data: any
	): Promise<void> {
		if (
			!data.guild.settings.muterole ||
			!this.interaction.guild.roles.cache.get(
				data.guild.settings.muterole
			)
		) {
			const noMuteRoleEmbed: EmbedBuilder = this.client.createEmbed(
				'Es ist keine Mute-Rolle eingestellt!',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [noMuteRoleEmbed] });
		}

		member = await this.interaction.guild.resolveMember(member.id);
		if (!member) {
			const noMemberEmbed: EmbedBuilder = this.client.createEmbed(
				'Du musst ein Mitglied angeben.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [noMemberEmbed] });
		}

		if (member.user.id === this.interaction.user.id) {
			const selfEmbed: EmbedBuilder = this.client.createEmbed(
				'Du kannst dich nicht selbst muten.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [selfEmbed] });
		}

		if (member.user.id === this.client.user!.id) {
			const meEmbed: EmbedBuilder = this.client.createEmbed(
				'Ich kann mich nicht selbst muten.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [meEmbed] });
		}

		if (member.user.bot) {
			const botEmbed: EmbedBuilder = this.client.createEmbed(
				'Du kannst keine Bots muten.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [botEmbed] });
		}

		if (
			member.roles.highest.position >=
			this.interaction.member.roles.highest.position
		) {
			const higherRoleEmbed: EmbedBuilder = this.client.createEmbed(
				'Du kannst keine Mitglieder muten, die eine höhere Rolle haben als du.',
				'error',
				'error'
			);
			return this.interaction.followUp({ embeds: [higherRoleEmbed] });
		}

		const muteRole: any = this.interaction.guild.roles.cache.get(
			data.guild.settings.muterole
		);
		if (
			[...muteRole.members].find(
				(mutedUser): boolean => mutedUser[0] === member.user.id
			)
		) {
			const alreadyMutedEmbed: EmbedBuilder = this.client.createEmbed(
				'{0} ist bereits gemutet.',
				'error',
				'error',
				member.user.username
			);
			return this.interaction.followUp({ embeds: [alreadyMutedEmbed] });
		}

		if (duration && !ms(duration)) {
			const invalidDurationEmbed: EmbedBuilder = this.client.createEmbed(
				'Du hast eine ungültige Dauer angegeben.',
				'error',
				'error'
			);
			return this.interaction.followUp({
				embeds: [invalidDurationEmbed]
			});
		}

		const mute: any = {
			victim: member,
			reason: reason || 'Kein Grund angegeben',
			duration: duration ? ms(duration) : 200 * 60 * 60 * 24 * 365 * 1000
		};

		let relativeTime: string = this.client.utils.getRelativeTime(
			Date.now() - mute.duration
		);
		if (mute.duration === 200 * 60 * 60 * 24 * 365 * 1000) {
			relativeTime = 'Permanent';
		}
		let unmuteDate: string = moment(Date.now() + mute.duration).format(
			'DD.MM.YYYY, HH:mm'
		);
		if (mute.duration === 200 * 60 * 60 * 24 * 365 * 1000) {
			unmuteDate = '/';
		}

		const areYouSureEmbed: EmbedBuilder = this.client.createEmbed(
			'Bist du dir sicher, dass du {0} muten möchtest?',
			'arrow',
			'warning',
			member.user.username
		);
		const buttonYes: ButtonBuilder = this.client.createButton(
			'confirm',
			'Ja',
			'Secondary',
			'success'
		);
		const buttonNo: ButtonBuilder = this.client.createButton(
			'decline',
			'Nein',
			'Secondary',
			'error'
		);
		const buttonRow: any = this.client.createMessageComponentsRow(
			buttonYes,
			buttonNo
		);

		const confirmationAskMessage: any = await this.interaction.followUp({
			embeds: [areYouSureEmbed],
			components: [buttonRow]
		});

		const confirmationButtonCollector: any =
			confirmationAskMessage.createMessageComponentCollector({
				filter: (i: any): boolean =>
					i.user.id === this.interaction.user.id,
				time: 1000 * 60 * 5,
				max: 1
			});
		confirmationButtonCollector.on(
			'collect',
			async (clicked: any): Promise<void> => {
				const confirmation = clicked.customId;

				switch (confirmation) {
					case 'confirm':
						mute.victim.roles
							.add(
								data.guild.settings.muterole,
								'MUTE - Dauer: ' +
									relativeTime +
									' | Begründung: ' +
									mute.reason +
									' | Moderator: ' +
									this.interaction.user.username +
									' | Unmute am: ' +
									unmuteDate
							)
							.then(async (): Promise<void> => {
								const victimData =
									await this.client.findOrCreateMember(
										mute.victim.user.id,
										this.interaction.guild.id
									);
								victimData.muted = {
									state: true,
									reason: mute.reason,
									moderator: {
										name: this.interaction.user.username,
										id: this.interaction.user.id
									},
									duration: mute.duration,
									mutedAt: Date.now(),
									mutedUntil: Date.now() + mute.duration
								};
								victimData.markModified('muted');
								await victimData.save();
								this.client.databaseCache.mutedUsers.set(
									mute.victim.user.id +
										this.interaction.guild.id,
									victimData
								);

								const privateText: string =
									'### ' +
									this.client.emotes.timeout +
									' Du wurdest auf {0} gemutet.\n\n' +
									this.client.emotes.arrow +
									' Begründung: ' +
									mute.reason +
									'\n' +
									this.client.emotes.arrow +
									' Dauer: ' +
									relativeTime +
									'\n' +
									this.client.emotes.arrow +
									' Moderator: ' +
									this.interaction.user.username +
									'\n' +
									this.client.emotes.arrow +
									' Unmute am: ' +
									unmuteDate;
								const privateMuteEmbed: EmbedBuilder =
									this.client.createEmbed(
										privateText,
										null,
										'error',
										this.interaction.guild.name
									);
								await mute.victim
									.send({ embeds: [privateMuteEmbed] })
									.catch((): void => {});

								const text: string =
									this.client.emotes.user +
									' Moderator: ' +
									this.interaction.user.username +
									'\n' +
									this.client.emotes.text +
									' Begründung: ' +
									mute.reason;
								const logEmbed: EmbedBuilder =
									this.client.createEmbed(
										text,
										null,
										'normal'
									);
								logEmbed.setTitle(
									this.client.emotes.timeout +
										' ' +
										mute.victim.user.username +
										' wurde gemutet'
								);
								logEmbed.setThumbnail(
									mute.victim.user.displayAvatarURL()
								);
								await this.interaction.guild.logAction(
									logEmbed,
									'moderation'
								);

								const publicText: string =
									'### ' +
									this.client.emotes.timeout +
									' {0} wurde gemutet.\n\n' +
									this.client.emotes.arrow +
									' Begründung: ' +
									mute.reason +
									'\n' +
									this.client.emotes.arrow +
									' Dauer: ' +
									relativeTime +
									'\n' +
									this.client.emotes.arrow +
									' Moderator: ' +
									this.interaction.user.username +
									'\n' +
									this.client.emotes.arrow +
									' Unmute am: ' +
									unmuteDate;
								const publicMuteEmbed: EmbedBuilder =
									this.client.createEmbed(
										publicText,
										null,
										'error',
										mute.victim.user.username
									);
								publicMuteEmbed.setImage(
									'https://c.tenor.com/VphNodL96w8AAAAC/mute-discord-mute.gif'
								);
								await clicked.update({
									embeds: [publicMuteEmbed],
									components: []
								});
							})
							.catch(async (): Promise<void> => {
								const cantMuteEmbed: EmbedBuilder =
									this.client.createEmbed(
										'Ich konnte {0} nicht muten.',
										'error',
										'error',
										mute.victim.user.username
									);
								await clicked.update({
									embeds: [cantMuteEmbed],
									components: []
								});
							});
						break;
					case 'decline':
						const declineEmbed: EmbedBuilder =
							this.client.createEmbed(
								'{0} wurde nicht gemutet.',
								'error',
								'error',
								mute.victim.user.username
							);
						await clicked.update({
							embeds: [declineEmbed],
							components: []
						});
						break;
				}
			}
		);
	}
}
