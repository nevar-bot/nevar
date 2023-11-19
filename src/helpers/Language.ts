import i18next from "i18next";
import i18nextBackend from "i18next-node-fs-backend";
import * as path from "path";
import fs from "fs";

async function walkDirectory(dir: any, namespaces: any[] = [], folderName = "") {
	const files: string[] = await fs.readdirSync(dir);

	const languages = [];
	for (const file of files) {
		const stat = await fs.statSync(path.join(dir, file));
		if (stat.isDirectory()) {
			const isLanguage: any = RegExp(/^[a-z]{2}(-[A-Z]{2})?$/).exec(file);
			if (isLanguage) languages.push(file);

			const folder = await walkDirectory(
				path.join(dir, file),
				namespaces,
				isLanguage ? "" : file + "/"
			);

			namespaces = folder.namespaces;
		} else {
			namespaces.push(folderName + file.replace(".json", ""));
		}
	}
	return {
		namespaces: [...new Set(namespaces)],
		languages
	};
}

export async function languages() {
	const options = {
		jsonIndent: 2,
		loadPath: path.resolve(__dirname, "../../locales/{{lng}}//{{ns}}.json")
	};

	const { namespaces, languages } = await walkDirectory(
		path.resolve(__dirname, "../../locales/")
	);

	i18next.use(i18nextBackend);

	await i18next.init({
		backend: options,
		debug: false,
		fallbackLng: "de",
		returnObjects: true,
		initImmediate: false,
		interpolation: {
			escapeValue: false
		},
		load: "all",
		ns: namespaces,
		preload: languages
	});

	return new Map(languages.map((item: string) => [item, i18next.getFixedT(item)]));
}
