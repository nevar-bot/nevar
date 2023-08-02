/** @format */

import guildSchema from '@schemas/Guild';
import BaseClient from '@structures/BaseClient';

async function updateGuildSchema(
	client: BaseClient,
	guildId: string
): Promise<void> {
	try {
		const guildData: any = await guildSchema.findOne({ id: guildId });

		if (!guildData) {
			return await guildSchema.create({ id: guildId });
		}

		const schemaTree: any = guildSchema.schema.tree;

		//   console.log(guildData);
		//   console.log(schemaTree);
		console.log(guildData instanceof guildSchema);

		addMissingEntries(guildData, schemaTree);
		removeUnusedEntries(guildData, schemaTree);
		function addMissingEntries(targetObj: any, schemaObj: any): void {
			for (const key in schemaObj) {
				const schemaValue = schemaObj[key];
				const targetValue = targetObj[key];

				if (isObject(schemaValue) && isObject(targetValue)) {
					addMissingEntries(targetValue, schemaValue);
				} else if (
					Array.isArray(schemaValue) &&
					Array.isArray(targetValue)
				) {
					for (let i = 0; i < targetValue.length; i++) {
						addMissingEntries(targetValue[i], schemaValue[0]);
					}
				} else if (!(key in targetObj)) {
					targetObj[key] = getDefaultFromSchema(schemaValue);
				}
			}
		}

		// Rekursive Funktion, um nicht mehr benötigte Einträge zu löschen
		function removeUnusedEntries(targetObj: any, schemaObj: any): void {
			const schemaKeys = Object.keys(schemaObj);

			for (const key in targetObj) {
				if (!schemaKeys.includes(key)) {
					delete targetObj[key];
				} else if (
					isObject(targetObj[key]) &&
					isObject(schemaObj[key])
				) {
					removeUnusedEntries(targetObj[key], schemaObj[key]);
				} else if (
					Array.isArray(targetObj[key]) &&
					Array.isArray(schemaObj[key])
				) {
					for (let i = 0; i < targetObj[key].length; i++) {
						if (
							isObject(targetObj[key][i]) &&
							isObject(schemaObj[key][0])
						) {
							removeUnusedEntries(
								targetObj[key][i],
								schemaObj[key][0]
							);
						}
					}
				}
			}
		}

		// Hilfsfunktion, um den Standardwert für ein Schema-Objekt zu erhalten
		function getDefaultFromSchema(schemaObj: any): any {
			if (isObject(schemaObj) && 'default' in schemaObj) {
				// Wenn ein Standardwert definiert ist, geben wir ihn zurück
				return schemaObj.default;
			} else if (typeof schemaObj === 'function') {
				// Wenn der Typ eine Funktion ist, z. B. [Function: Object], geben wir ein leeres Objekt zurück
				return {};
			} else if (
				Array.isArray(schemaObj) &&
				schemaObj.length === 1 &&
				isObject(schemaObj[0])
			) {
				// Wenn der Typ ein Array von Objekten ist, geben wir ein leeres Array mit einem leeren Objekt zurück
				return [{}];
			}
			// Hier kannst du weitere Fälle behandeln, je nachdem, wie dein Schema aussieht
			// z. B. wenn der Typ ein String, Number, Date, etc. ist
			return null;
		}

		// Hilfsfunktion, um zu überprüfen, ob ein Wert ein Objekt ist (kein Array oder null)
		function isObject(value: any): boolean {
			return (
				typeof value === 'object' &&
				value !== null &&
				!Array.isArray(value)
			);
		}
	} catch (e: any) {
		console.error(e.stack);
	}
}

export default updateGuildSchema;
