import BaseClient from "@structures/BaseClient";

export default class BaseGame {
    protected options: any;
    protected client: BaseClient;
    protected interaction: any;

    protected constructor(options: any = {}) {
        this.options = options;
        this.client = options.client;
        this.interaction = options.interaction;
    }

    protected async sendMessage(content: any): Promise<any> {
        return await this.interaction.editReply(content);
    }

    protected shuffleArray(array: any[]): any[] {
        for (let i: number = array.length - 1; i > 0; i--) {
            const j: number = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    protected disableButtons(components: any): any {
        for (const element of components) {
            for (const component of element.components) {
                component.data.disabled = true;
            }
        }

        return components;
    }
}