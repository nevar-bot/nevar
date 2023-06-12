import BaseClient from "@structures/BaseClient";

export default class {
    public client: BaseClient;

    constructor(client: BaseClient) {
        this.client = client;
    }

    async dispatch(interaction: any, customId: any, data: any): Promise<any> {

        /* Get type of vote */
        const type: any = customId[2];

        /* Get suggestion embed message */
        const suggestionEmbedMessage: any = interaction.message;

        if(!data.member?.suggestions){
            data.member.suggestions = [];
            data.member.markModified("suggestion");
            await data.member.save();
        }

        /* Check if user already voted */
        const userHasAlreadyVoted: any = data.member.suggestions.find((s: any): any => s.id === suggestionEmbedMessage.id) || null;

        if(userHasAlreadyVoted && userHasAlreadyVoted.type === 1 && type === "yes") return interaction.deferUpdate();
        if(userHasAlreadyVoted && userHasAlreadyVoted.type === 0 && type === "no") return interaction.deferUpdate();

        /* Get current footer of embed */
        const currentEmbedFooter: any = suggestionEmbedMessage.embeds[0].footer.text;

        /* Get current votes */
        const currentUpvotes: any = currentEmbedFooter.split(" • ")[0].split(" ")[1];
        const currentDownVotes: any = currentEmbedFooter.split(" • ")[1].split(" ")[1];

        /* Save to database */
        data.member.suggestions = data.member.suggestions.filter((s: any) => s.id !== suggestionEmbedMessage.id);
        data.member.suggestions.push({ id: suggestionEmbedMessage.id, type: (type === "yes" ? 1 : 0) });
        data.member.markModified("suggestion");
        await data.member.save();

        /* Update embed */
        let newUpVotes: number = 0;
        let newDownVotes: number = 0;

        if(type === "yes"){
            newUpVotes = parseInt(String(Number(currentUpvotes) + 1));
            newDownVotes = parseInt(String((userHasAlreadyVoted ? parseInt(currentDownVotes) - 1 : parseInt(currentDownVotes))));
        }else if(type === "no"){
            newUpVotes = parseInt(String((userHasAlreadyVoted ? parseInt(currentUpvotes) - 1 : parseInt(currentUpvotes))));
            newDownVotes = parseInt(String(parseInt(currentDownVotes) + 1));
        }

        if(newUpVotes < 0) newUpVotes = 0;
        if(newDownVotes < 0) newDownVotes = 0;

        suggestionEmbedMessage.embeds[0].data.footer.text = "👍 " + newUpVotes + " • 👎 " + newDownVotes;

        /* Edit embed message */
        suggestionEmbedMessage.edit({ embeds: [suggestionEmbedMessage.embeds[0]], components: [suggestionEmbedMessage.components[0]] });
        await interaction.deferUpdate();
    }
}